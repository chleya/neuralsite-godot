// Store - Scene state management with Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnyNode, AnyNodeId, ConstructionPhase, Entity, StationRange } from './schema';
import { entityToNode, formatStation } from './schema';
import { apiService, type EntityUpdate } from './api';

// Selection state
export interface SelectionState {
  nodeId: AnyNodeId | null;
  nodeType: string | null;
  position: { x: number; y: number; z: number } | null;
}

// Timeline state for time travel
export interface TimelineEntry {
  timestamp: string;
  progress: number;
  phase: ConstructionPhase;
}

// UI Notification
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

// Scene state
interface SceneState {
  nodes: Record<AnyNodeId, AnyNode>;
  rootNodeIds: AnyNodeId[];
  dirtyNodes: Set<AnyNodeId>;
  selection: SelectionState;
  currentDay: number;
  totalDays: number;
  timeScale: number;
  isPlaying: boolean;
  isLoading: boolean;
  apiConnected: boolean;
  history: Record<string, TimelineEntry[]>;
  notifications: Notification[];
  layerVisibility: Record<string, boolean>;
  previewEntity: AnyNode | null;
  
  // Undo/Redo history
  undoStack: Array<{ nodes: Record<AnyNodeId, AnyNode>; rootNodeIds: AnyNodeId[] }>;
  redoStack: Array<{ nodes: Record<AnyNodeId, AnyNode>; rootNodeIds: AnyNodeId[] }>;
  
  // Pending operations for deduplication
  pendingOperations: Set<string>;
  
  // Notification timeout tracking
  notificationTimeouts: Record<string, ReturnType<typeof setTimeout>>;

  setScene: (nodes: Record<AnyNodeId, AnyNode>, rootNodeIds: AnyNodeId[]) => void;
  loadDefaultScene: () => void;
  loadFromAPI: () => Promise<void>;
  clearScene: () => void;
  toggleLayerVisibility: (layerType: string) => void;
  setLayerVisibility: (layerType: string, visible: boolean) => void;
  setPreviewEntity: (node: AnyNode | null) => void;
  
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  markDirty: (id: AnyNodeId) => void;
  clearDirty: (id: AnyNodeId) => void;
  
  createNode: (node: AnyNode) => Promise<{ success: boolean; error?: string }>;
  updateNode: (id: AnyNodeId, data: Partial<AnyNode>) => Promise<{ success: boolean; error?: string }>;
  deleteNode: (id: AnyNodeId) => Promise<{ success: boolean; error?: string }>;
  copyNode: (id: AnyNodeId, offset?: number) => Promise<{ success: boolean; error?: string; newId?: string }>;
  
  setSelection: (selection: SelectionState) => void;
  clearSelection: () => void;
  
  setCurrentDay: (day: number) => void;
  setTimeScale: (scale: number) => void;
  play: () => void;
  pause: () => void;
  
  loadEntityHistory: (entityId: string) => Promise<void>;
  getNode: (id: AnyNodeId) => AnyNode | undefined;
  getNodesByType: <T extends AnyNode>(type: string) => T[];
  checkApiConnection: () => Promise<boolean>;
  
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

// Create default scene with sample entities
function createDefaultScene(): { nodes: Record<AnyNodeId, AnyNode>; rootNodeIds: AnyNodeId[] } {
  const roadId = 'road_demo1';
  const bridgeId = 'bridge_demo1';
  
  const nodes: Record<string, AnyNode> = {
    [roadId]: {
      id: roadId,
      type: 'road',
      name: 'K1+000 示范段',
      visible: true,
      stationRange: {
        start: { value: 1000, formatted: 'K1+000' },
        end: { value: 1500, formatted: 'K1+500' },
      },
      lanes: 4,
      width: 12,
      elevation: 0,
      elevation_base: 0,
      lateral_offset: 0,
      phase: 'earthwork',
      progress: 0.45,
    },
    [bridgeId]: {
      id: bridgeId,
      type: 'bridge',
      name: 'K2+000 跨河大桥',
      visible: true,
      stationRange: {
        start: { value: 2000, formatted: 'K2+000' },
        end: { value: 2080, formatted: 'K2+080' },
      },
      width: 12,
      spanCount: 2,
      spanLength: 40,
      elevation_base: 0,
      lateral_offset: 0,
      phase: 'earthwork',
      progress: 0.3,
      parts: {
        piles: [
          { id: 'pile_1', station: 2005, lateral: -6, height: 15, diameter: 1.5, status: 'completed' },
          { id: 'pile_2', station: 2005, lateral: 6, height: 15, diameter: 1.5, status: 'completed' },
          { id: 'pile_3', station: 2075, lateral: -6, height: 15, diameter: 1.5, status: 'in_progress' },
          { id: 'pile_4', station: 2075, lateral: 6, height: 15, diameter: 1.5, status: 'pending' },
        ],
        piers: [
          { id: 'pier_1', station: 2040, lateral: -6, height: 10, diameter: 2, status: 'completed' },
          { id: 'pier_2', station: 2040, lateral: 6, height: 10, diameter: 2, status: 'completed' },
        ],
        beams: [],
        deck: { thickness: 0.5, status: 'pending' },
      },
    },
  };
  
  return {
    nodes,
    rootNodeIds: [roadId, bridgeId],
  };
}

export const useSceneStore = create<SceneState>()(
  persist(
    (set, get) => ({
      nodes: {},
      rootNodeIds: [],
      dirtyNodes: new Set<AnyNodeId>(),
      selection: { nodeId: null, nodeType: null, position: null },
      currentDay: 0,
      totalDays: 365,
      timeScale: 1.0,
      isPlaying: false,
      isLoading: false,
      apiConnected: false,
      history: {},
      notifications: [],
      layerVisibility: {
        road: true,
        bridge: true,
        vehicle: true,
        safety_sign: true,
        fence: true,
      },
      previewEntity: null,
      undoStack: [],
      redoStack: [],
      pendingOperations: new Set<string>(),
      notificationTimeouts: {},
      
      undo: () => {
        const { undoStack } = get();
        if (undoStack.length === 0) return;
        
        const currentState = { nodes: get().nodes, rootNodeIds: get().rootNodeIds };
        const previousState = undoStack[undoStack.length - 1];
        
        set({
          nodes: previousState.nodes,
          rootNodeIds: previousState.rootNodeIds,
          undoStack: undoStack.slice(0, -1),
          redoStack: [...get().redoStack, currentState],
        });
        
        get().addNotification({
          type: 'info',
          message: '已撤销',
          duration: 2000,
        });
      },
      
      redo: () => {
        const { redoStack } = get();
        if (redoStack.length === 0) return;
        
        const currentState = { nodes: get().nodes, rootNodeIds: get().rootNodeIds };
        const nextState = redoStack[redoStack.length - 1];
        
        set({
          nodes: nextState.nodes,
          rootNodeIds: nextState.rootNodeIds,
          undoStack: [...get().undoStack, currentState],
          redoStack: redoStack.slice(0, -1),
        });
        
        get().addNotification({
          type: 'info',
          message: '已重做',
          duration: 2000,
        });
      },
      
      canUndo: () => get().undoStack.length > 0,
      canRedo: () => get().redoStack.length > 0,
      
      toggleLayerVisibility: (layerType) => {
        set((state) => ({
          layerVisibility: {
            ...state.layerVisibility,
            [layerType]: !state.layerVisibility[layerType],
          },
        }));
      },
      
      setLayerVisibility: (layerType, visible) => {
        set((state) => ({
          layerVisibility: {
            ...state.layerVisibility,
            [layerType]: visible,
          },
        }));
      },
      
      setPreviewEntity: (node) => {
        set({ previewEntity: node });
      },
      
      loadDefaultScene: () => {
        const { nodes, rootNodeIds } = createDefaultScene();
        set({
          nodes,
          rootNodeIds,
          dirtyNodes: new Set(rootNodeIds),
          isLoading: false,
        });
      },
      
      loadFromAPI: async () => {
        set({ isLoading: true });
        try {
          // Load real entities from backend database
          const result = await apiService.getEntities({ limit: 1000 });
          const entities = result.items;
          
          if (entities.length > 0) {
            // Convert database entities to scene nodes
            const nodeMap: Record<string, AnyNode> = {};
            const rootIds: string[] = [];
            
            entities.forEach((entity: Entity) => {
              const node = entityToNode(entity);
              nodeMap[node.id] = node;
              rootIds.push(node.id);
            });
            
            set({
              nodes: nodeMap,
              rootNodeIds: rootIds,
              dirtyNodes: new Set(rootIds),
              apiConnected: true,
              isLoading: false,
            });
          } else {
            // Fallback to demo if no data
            get().loadDefaultScene();
            set({ isLoading: false, apiConnected: false });
          }
        } catch (error) {
          console.error('Failed to load from API:', error);
          get().loadDefaultScene();
          set({ isLoading: false, apiConnected: false });
          get().addNotification({
            type: 'error',
            message: '无法连接到服务器，已加载演示数据',
            duration: 8000,
          });
        }
      },
      
      setScene: (nodes, rootNodeIds) => {
        set({
          nodes,
          rootNodeIds,
          dirtyNodes: new Set(Object.keys(nodes)),
        });
      },
      
      clearScene: () => {
        set({
          nodes: {},
          rootNodeIds: [],
          dirtyNodes: new Set(),
          selection: { nodeId: null, nodeType: null, position: null },
          history: {},
        });
      },
      
      markDirty: (id) => {
        set((state) => ({
          dirtyNodes: new Set([...state.dirtyNodes, id]),
        }));
      },
      
      clearDirty: (id) => {
        set((state) => {
          const newDirty = new Set(state.dirtyNodes);
          newDirty.delete(id);
          return { dirtyNodes: newDirty };
        });
      },
      
      createNode: async (node) => {
        // Save current state for undo
        const currentState = { nodes: get().nodes, rootNodeIds: get().rootNodeIds };
        
        // Add to local state first (optimistic update)
        set((state) => ({
          nodes: { ...state.nodes, [node.id]: node },
          rootNodeIds: [...state.rootNodeIds, node.id],
          dirtyNodes: new Set([...state.dirtyNodes, node.id]),
          undoStack: [...state.undoStack, currentState],
          redoStack: [],
        }));
        
        // Try to sync to backend
        try {
          const stationStart = 'stationRange' in node ? node.stationRange.start.formatted : formatStation(0);
          const stationEnd = 'stationRange' in node ? node.stationRange.end.formatted : formatStation(1000);
          
          let entityType = (node as any).type || 'road';
          if (entityType === 'roadbed') entityType = 'road';
          
          const createdEntity = await apiService.createEntity({
            entity_type: entityType,
            code: node.id,
            name: node.name,
            start_station: stationStart,
            end_station: stationEnd,
            lateral_offset: (node as any).lateral_offset || 0,
            width: (node as any).width || null,
            height: (node as any).height || null,
            lanes: (node as any).lanes || 4,
            design_elevation: (node as any).elevation || null,
            progress: node.progress ?? 0,
            construction_phase: node.phase || 'planning',
          });
          
          // Update local state with server response (server might modify fields)
          if (createdEntity && createdEntity.id !== node.id) {
            // Server used different ID - update local mapping
            set((state) => {
              const newNodes = { ...state.nodes };
              delete newNodes[node.id];
              newNodes[createdEntity.id] = {
                ...node,
                id: createdEntity.id,
                ...createdEntity,
              };
              return {
                nodes: newNodes,
                rootNodeIds: state.rootNodeIds.map(id => id === node.id ? createdEntity.id : id),
              };
            });
          }
          
          get().addNotification({
            type: 'success',
            message: `已创建实体: ${node.name}`,
            duration: 3000,
          });
          
          // Clear dirty flag on success
          set((state) => {
            const newDirty = new Set(state.dirtyNodes);
            newDirty.delete(node.id);
            return { dirtyNodes: newDirty };
          });
          
          return { success: true, synced: true };
        } catch (error) {
          // API failed - rollback local state
          set({
            nodes: currentState.nodes,
            rootNodeIds: currentState.rootNodeIds,
            dirtyNodes: new Set([...get().dirtyNodes].filter(id => id !== node.id)),
          });
          
          const errorMessage = error instanceof Error ? error.message : 'API不可用';
          get().addNotification({
            type: 'error',
            message: `创建失败: ${errorMessage}`,
            duration: 5000,
          });
          
          return { success: false, error: errorMessage };
        }
      },
      
      updateNode: async (id, data) => {
        const existing = get().nodes[id];
        if (!existing) return { success: false, error: '实体不存在' };
        
        // Deduplication: skip if there's already a pending update for this node
        const operationKey = `update:${id}`;
        if (get().pendingOperations.has(operationKey)) {
          return { success: false, error: '更新已在进行中' };
        }
        
        // Mark operation as pending
        set((state) => ({
          pendingOperations: new Set(state.pendingOperations).add(operationKey),
        }));
        
        // Save current state for undo
        const currentState = { nodes: get().nodes, rootNodeIds: get().rootNodeIds };
        
        // Optimistic update
        set((state) => ({
          nodes: {
            ...state.nodes,
            [id]: { ...existing, ...data } as AnyNode,
          },
          dirtyNodes: new Set([...state.dirtyNodes, id]),
          undoStack: [...state.undoStack, currentState],
          redoStack: [],
        }));
        
        // Sync to backend
        try {
          const updateData: EntityUpdate = {};
          
          if ('name' in data && data.name !== undefined) {
            updateData.name = data.name;
          }
          if ('stationRange' in data && data.stationRange) {
            const sr = data.stationRange as StationRange;
            if (sr?.start?.formatted) updateData.start_station = sr.start.formatted;
            if (sr?.end?.formatted) updateData.end_station = sr.end.formatted;
          }
          if ('progress' in data && data.progress !== undefined) {
            updateData.progress = data.progress;
          }
          if ('phase' in data && data.phase !== undefined) {
            updateData.construction_phase = data.phase;
          }
          if ('width' in data && data.width !== undefined) {
            updateData.width = data.width;
          }
          if ('height' in data && data.height !== undefined) {
            updateData.height = data.height;
          }
          if ('lanes' in data && data.lanes !== undefined) {
            updateData.lanes = data.lanes;
          }
          if ('lateral_offset' in data && data.lateral_offset !== undefined) {
            updateData.lateral_offset = data.lateral_offset;
          }
          if ('elevation' in data && data.elevation !== undefined) {
            updateData.design_elevation = data.elevation;
          }
          if ('planned_start_date' in data) {
            updateData.planned_start_date = data.planned_start_date as string | null;
          }
          if ('planned_end_date' in data) {
            updateData.planned_end_date = data.planned_end_date as string | null;
          }
          if ('quality_status' in data) {
            updateData.quality_status = data.quality_status as string | null;
          }
          if ('safety_level' in data) {
            updateData.safety_level = data.safety_level as string | null;
          }
          if ('status' in data) {
            updateData.status = data.status as string | null;
          }
          if ('notes' in data) {
            updateData.notes = data.notes as string | null;
          }
          
          if (Object.keys(updateData).length > 0) {
            await apiService.updateEntity(id, updateData);
          }
          
          // Clear pending operation
          set((state) => {
            const newPending = new Set(state.pendingOperations);
            newPending.delete(operationKey);
            return { pendingOperations: newPending };
          });
          
          // Clear dirty flag on success
          set((state) => {
            const newDirty = new Set(state.dirtyNodes);
            newDirty.delete(id);
            return { dirtyNodes: newDirty };
          });
          
          return { success: true };
        } catch (error) {
          // Rollback optimistic update
          set({
            nodes: currentState.nodes,
            rootNodeIds: currentState.rootNodeIds,
          });
          
          // Clear dirty flag on failure
          set((state) => {
            const newDirty = new Set(state.dirtyNodes);
            newDirty.delete(id);
            return { dirtyNodes: newDirty };
          });
          
          // Clear pending operation on failure
          set((state) => {
            const newPending = new Set(state.pendingOperations);
            newPending.delete(operationKey);
            return { pendingOperations: newPending };
          });
          
          const errorMessage = error instanceof Error ? error.message : '更新失败';
          get().addNotification({
            type: 'error',
            message: `更新失败: ${errorMessage}`,
            duration: 5000,
          });
          
          return { success: false, error: errorMessage };
        }
      },
      
      deleteNode: async (id) => {
        const existing = get().nodes[id];
        if (!existing) return { success: false, error: '实体不存在' };
        
        // Save current state for undo
        const currentState = { nodes: get().nodes, rootNodeIds: get().rootNodeIds };
        
        // Optimistic update
        set((state) => {
          const newNodes: Record<string, AnyNode> = {};
          for (const key of Object.keys(state.nodes)) {
            if (key !== id) {
              newNodes[key] = state.nodes[key];
            }
          }
          return {
            nodes: newNodes,
            rootNodeIds: state.rootNodeIds.filter((rid) => rid !== id),
            dirtyNodes: new Set([...state.dirtyNodes].filter((did) => did !== id)),
            selection:
              state.selection.nodeId === id
                ? { nodeId: null, nodeType: null, position: null }
                : state.selection,
            undoStack: [...state.undoStack, currentState],
            redoStack: [],
          };
        });
        
        // Sync to backend
        try {
          await apiService.deleteEntity(id);
          
          get().addNotification({
            type: 'success',
            message: `已删除实体: ${existing.name}`,
            duration: 3000,
          });
          
          return { success: true };
        } catch (error) {
          // Rollback to previous state on failure
          set({
            nodes: currentState.nodes,
            rootNodeIds: currentState.rootNodeIds,
            undoStack: currentState.undoStack,
          });
          
          const errorMessage = error instanceof Error ? error.message : '删除失败';
          get().addNotification({
            type: 'error',
            message: `删除失败: ${errorMessage} - 已恢复数据`,
            duration: 8000,
          });
          
          return { success: false, error: errorMessage };
        }
      },
      
      copyNode: async (id, offsetStation = 500) => {
        const existing = get().nodes[id];
        if (!existing) return { success: false, error: '实体不存在' };
        
        // Create a copy with new ID and shifted station range
        const newId = `${existing.type}_copy_${Date.now()}`;
        const copiedNode: AnyNode = {
          ...JSON.parse(JSON.stringify(existing)),
          id: newId,
          name: `${existing.name} (副本)`,
        } as AnyNode;
        
        // Shift station range if it exists
        if ('stationRange' in copiedNode && copiedNode.stationRange) {
          const oldStart = copiedNode.stationRange.start.value;
          const oldEnd = copiedNode.stationRange.end.value;
          const length = oldEnd - oldStart;
          
          copiedNode.stationRange = {
            start: { 
              value: oldStart + offsetStation, 
              formatted: `K${Math.floor((oldStart + offsetStation) / 1000)}+${String((oldStart + offsetStation) % 1000).padStart(3, '0')}` 
            },
            end: { 
              value: oldEnd + offsetStation, 
              formatted: `K${Math.floor((oldEnd + offsetStation) / 1000)}+${String((oldEnd + offsetStation) % 1000).padStart(3, '0')}` 
            },
          };
        }
        
        // Create the copy (reuse createNode logic)
        const result = await get().createNode(copiedNode);
        
        if (result.success) {
          get().addNotification({
            type: 'success',
            message: `已复制实体: ${copiedNode.name}`,
            duration: 3000,
          });
          return { success: true, newId };
        }
        
        return { success: false, error: '复制失败' };
      },
      
      setSelection: (selection) => set({ selection }),
      
      clearSelection: () =>
        set({ selection: { nodeId: null, nodeType: null, position: null } }),
      
      setCurrentDay: (day) =>
        set({ currentDay: Math.max(0, Math.min(day, get().totalDays)) }),
      
      setTimeScale: (scale) =>
        set({ timeScale: Math.max(0.1, Math.min(scale, 10)) }),
      
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      
      loadEntityHistory: async (entityId) => {
        try {
          const history = await apiService.getEntityHistory(entityId) as Array<{
            timestamp: string;
            progress: number;
            state_type: string;
          }>;
          set((state) => ({
            history: {
              ...state.history,
              [entityId]: history.map((h) => ({
                timestamp: h.timestamp,
                progress: h.progress,
                phase: h.state_type as ConstructionPhase,
              })),
            },
          }));
        } catch (error) {
          console.error('Failed to load entity history:', error);
        }
      },
      
      getNode: (id) => get().nodes[id],
      
      getNodesByType: <T extends AnyNode>(type: string): T[] => {
        return Object.values(get().nodes).filter((n) => n.type === type) as T[];
      },
      
      checkApiConnection: async () => {
        const connected = await apiService.healthCheck();
        set({ apiConnected: connected });
        return connected;
      },
      
      addNotification: (notification) => {
        const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotification = { ...notification, id };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));
        
        // Auto-remove after duration
        if (notification.duration) {
          const timeout = setTimeout(() => {
            get().removeNotification(id);
          }, notification.duration);
          set((state) => ({
            notificationTimeouts: { ...state.notificationTimeouts, [id]: timeout },
          }));
        }
      },
      
      removeNotification: (id) => {
        // Clear timeout if exists
        const timeouts = get().notificationTimeouts;
        if (timeouts[id]) {
          clearTimeout(timeouts[id]);
          const newTimeouts = { ...timeouts };
          delete newTimeouts[id];
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
            notificationTimeouts: newTimeouts,
          }));
        } else {
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }));
        }
      },
    }),
    {
      name: 'neuralsite-scene',
      partialize: (state) => ({
        nodes: state.nodes,
        rootNodeIds: state.rootNodeIds,
        currentDay: state.currentDay,
        layerVisibility: state.layerVisibility,
      }),
    }
  )
);

// Helper hooks
export const useSelectedNode = () => {
  const selection = useSceneStore((s) => s.selection);
  const nodes = useSceneStore((s) => s.nodes);
  if (!selection.nodeId) return null;
  return nodes[selection.nodeId] || null;
};

export const useNode = <T extends AnyNode>(id: string): T | undefined => {
  return useSceneStore((s) => s.nodes[id]) as T | undefined;
};

export const useDirtyNodes = () => {
  return [...useSceneStore((s) => s.dirtyNodes)];
};
