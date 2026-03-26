// History Store - Undo/Redo with state snapshots
import { create } from 'zustand';
import { useSceneStore } from './store';
import type { AnyNode, AnyNodeId } from './schema';

interface HistoryEntry {
  id: string;
  timestamp: number;
  description: string;
  nodesSnapshot: Record<AnyNodeId, AnyNode>;
  rootNodeIdsSnapshot: AnyNodeId[];
  selectedIdSnapshot: AnyNodeId | null;
}

interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  maxHistory: number;
  
  // Actions
  pushState: (description: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

// Create snapshot of current state
function createSnapshot(description: string): HistoryEntry {
  const state = useSceneStore.getState();
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    description,
    nodesSnapshot: { ...state.nodes },
    rootNodeIdsSnapshot: [...state.rootNodeIds],
    selectedIdSnapshot: state.selection.nodeId,
  };
}

// Restore state from snapshot
function restoreSnapshot(entry: HistoryEntry) {
  useSceneStore.setState({
    nodes: { ...entry.nodesSnapshot },
    rootNodeIds: [...entry.rootNodeIdsSnapshot],
    selection: {
      nodeId: entry.selectedIdSnapshot,
      nodeType: entry.selectedIdSnapshot ? useSceneStore.getState().nodes[entry.selectedIdSnapshot]?.type || null : null,
      position: null,
    },
  });
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  maxHistory: 50,

  pushState: (description: string) => {
    const snapshot = createSnapshot(description);
    
    set((state) => ({
      past: [...state.past.slice(-(state.maxHistory - 1)), snapshot],
      future: [], // Clear future on new action
    }));
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return;

    const currentSnapshot = createSnapshot('undo-point');
    const previousSnapshot = past[past.length - 1];
    
    // Restore previous state
    restoreSnapshot(previousSnapshot);
    
    set({
      past: past.slice(0, -1),
      future: [currentSnapshot, ...future],
    });
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return;

    const currentSnapshot = createSnapshot('redo-point');
    const nextSnapshot = future[0];
    
    // Restore next state
    restoreSnapshot(nextSnapshot);
    
    set({
      past: [...past, currentSnapshot],
      future: future.slice(1),
    });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  clear: () => set({ past: [], future: [] }),
}));

// Hook to use history with automatic push on node changes
export function useHistoryTracking() {
  const pushState = useHistoryStore((s) => s.pushState);
  const canUndo = useHistoryStore((s) => s.canUndo);
  const canRedo = useHistoryStore((s) => s.canRedo);
  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);

  return {
    pushState,
    canUndo,
    canRedo,
    undo,
    redo,
  };
}

// Auto-push state wrapper for store actions
export function withHistory<T extends (...args: unknown[]) => unknown>(
  action: T,
  description: string
): T {
  return ((...args: unknown[]) => {
    useHistoryStore.getState().pushState(description);
    return action(...args);
  }) as T;
}
