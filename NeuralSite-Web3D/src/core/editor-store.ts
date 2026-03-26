// Editor Store - Tool and selection state management
import { create } from 'zustand';

export type Tool = 
  | 'select'      // 选择
  | 'move'        // 移动
  | 'rotate'      // 旋转
  | 'copy'        // 复制
  | 'delete'      // 删除
  | 'offset'      // 偏移
  | 'mirror'      // 镜像
  | 'scale'       // 缩放
  | 'pan'         // 平移视图
  | 'zoom'        // 缩放视图
  | 'road'        // 道路绘制
  | 'bridge'      // 桥梁绘制
  | 'fence'       // 围挡绘制
  | 'sign';       // 标识绘制

export type Phase = 'view' | 'edit';

interface EditorState {
  activeTool: Tool;
  phase: Phase;
  selectedIds: string[];
  hoveredId: string | null;
  isPreviewValid: boolean;
  rotation: number;
  snapToGrid: boolean;
  gridSize: number;
  showGrid: boolean;
  cursorPosition: { x: number; y: number; z: number };
  statusMessage: string;
  clipboardIds: string[];
  
  // CAD-style modes
  orthoEnabled: boolean;
  snapEnabled: boolean;
  polarEnabled: boolean;
  polarAngle: number;
  
  // Selection mode
  selectionMode: 'window' | 'crossing' | null;
  selectionStart: { x: number; y: number } | null;
  selectionEnd: { x: number; y: number } | null;
  
  // Direct distance input
  distanceInput: string | null;
  lastPoint: { x: number; y: number; z: number } | null;
  
  // Layer visibility
  visibleNodes: Record<string, boolean>;
  
  // View mode
  viewMode: '3d' | 'top' | 'side';
  setViewMode: (mode: '3d' | 'top' | 'side') => void;
  
  setTool: (tool: Tool) => void;
  setPhase: (phase: Phase) => void;
  setSelectedIds: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
  copySelected: () => void;
  setHoveredId: (id: string | null) => void;
  setPreviewValid: (valid: boolean) => void;
  rotateBy: (delta: number) => void;
  setRotation: (rotation: number) => void;
  toggleGridSnap: () => void;
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  setCursorPosition: (pos: { x: number; y: number; z: number }) => void;
  setStatusMessage: (msg: string) => void;
  toggleOrtho: () => void;
  toggleSnap: () => void;
  togglePolar: () => void;
  setPolarAngle: (angle: number) => void;
  startSelection: (point: { x: number; y: number }) => void;
  updateSelection: (point: { x: number; y: number }) => void;
  endSelection: () => { x: number; y: number; width: number; height: number } | null;
  setDistanceInput: (dist: string | null) => void;
  setLastPoint: (point: { x: number; y: number; z: number } | null) => void;
  setVisibleNodes: (nodes: Record<string, boolean>) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  activeTool: 'select',
  phase: 'view',
  selectedIds: [],
  hoveredId: null,
  isPreviewValid: true,
  rotation: 0,
  snapToGrid: true,
  gridSize: 0.5,
  showGrid: true,
  cursorPosition: { x: 0, y: 0, z: 0 },
  statusMessage: '就绪',
  clipboardIds: [],
  
  // CAD-style modes
  orthoEnabled: false,
  snapEnabled: true,
  polarEnabled: false,
  polarAngle: 90,
  
  // Selection mode
  selectionMode: null,
  selectionStart: null,
  selectionEnd: null,
  
  // Direct distance input
  distanceInput: null,
  lastPoint: null,

  // Layer visibility
  visibleNodes: {
    road: true,
    bridge: true,
    culvert: true,
    fence: true,
    sign: true,
  },

  // View mode
  viewMode: '3d' as '3d' | 'top' | 'side',
  setViewMode: (mode) => set({ viewMode: mode }),

  setTool: (tool) => {
    const messages: Record<Tool, string> = {
      select: '选择工具 - 点击选择对象，Ctrl+点击多选',
      move: '移动工具 - 拖拽移动对象',
      rotate: '旋转工具 - 拖拽旋转对象',
      copy: '复制工具 - 按住Alt复制对象',
      delete: '删除工具 - 点击删除对象',
      offset: '偏移工具 - 点击选择偏移距离',
      mirror: '镜像工具 - 选择镜像线',
      scale: '缩放工具 - 拖拽缩放对象',
      pan: '平移工具 - 拖拽平移视图',
      zoom: '缩放工具 - 拖拽缩放视图',
      road: '道路工具 - 点击设置起点和终点创建道路',
      bridge: '桥梁工具 - 点击设置起点和终点创建桥梁',
      fence: '围挡工具 - 点击设置围挡位置',
      sign: '标识工具 - 点击放置标识牌',
    };
    set({ activeTool: tool, statusMessage: messages[tool] });
  },
  
  setPhase: (phase) => set({ phase }),
  
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  
  addToSelection: (id) => {
    const { selectedIds } = get();
    if (!selectedIds.includes(id)) {
      set({ selectedIds: [...selectedIds, id] });
    }
  },
  
  removeFromSelection: (id) => {
    const { selectedIds } = get();
    set({ selectedIds: selectedIds.filter((sid) => sid !== id) });
  },
  
  toggleSelection: (id) => {
    const { selectedIds } = get();
    if (selectedIds.includes(id)) {
      set({ selectedIds: selectedIds.filter((sid) => sid !== id) });
    } else {
      set({ selectedIds: [...selectedIds, id] });
    }
  },
  
  clearSelection: () => set({ selectedIds: [], statusMessage: '选择已清除' }),
  
  selectAll: (ids) => set({ selectedIds: ids, statusMessage: `已选择 ${ids.length} 个对象` }),
  
  copySelected: () => {
    const { selectedIds } = get();
    set({ clipboardIds: [...selectedIds] });
  },
  
  setHoveredId: (id) => set({ hoveredId: id }),
  
  setPreviewValid: (valid) => set({ isPreviewValid: valid }),
  
  rotateBy: (delta) => {
    const newRotation = get().rotation + delta;
    set({ rotation: newRotation });
  },
  
  setRotation: (rotation) => set({ rotation }),
  
  toggleGridSnap: () => set({ snapToGrid: !get().snapToGrid }),
  
  toggleGrid: () => set({ showGrid: !get().showGrid }),
  
  setGridSize: (size) => set({ gridSize: size }),
  
  setCursorPosition: (pos) => set({ cursorPosition: pos }),
  
  setStatusMessage: (msg) => set({ statusMessage: msg }),
  
  toggleOrtho: () => set({ orthoEnabled: !get().orthoEnabled }),
  
  toggleSnap: () => set({ snapEnabled: !get().snapEnabled }),
  
  togglePolar: () => set({ polarEnabled: !get().polarEnabled }),
  
  setPolarAngle: (angle) => set({ polarAngle: angle }),
  
  startSelection: (point) => set({ 
    selectionMode: 'window', 
    selectionStart: point,
    selectionEnd: point,
  }),
  
  updateSelection: (point) => set({ selectionEnd: point }),
  
  endSelection: () => {
    const { selectionStart, selectionEnd } = get();
    if (!selectionStart || !selectionEnd) return null;
    
    const minX = Math.min(selectionStart.x, selectionEnd.x);
    const maxX = Math.max(selectionStart.x, selectionEnd.x);
    const minY = Math.min(selectionStart.y, selectionEnd.y);
    const maxY = Math.max(selectionStart.y, selectionEnd.y);
    
    const result = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
    
    // Determine if window or crossing
    const isWindow = selectionEnd.x >= selectionStart.x && selectionEnd.y >= selectionStart.y;
    set({ 
      selectionMode: isWindow ? 'window' : 'crossing',
    });
    
    return result;
  },
  
  setDistanceInput: (dist) => set({ distanceInput: dist }),
  
  setLastPoint: (point) => set({ lastPoint: point }),
  
  setVisibleNodes: (nodes) => set({ visibleNodes: nodes }),
}));
