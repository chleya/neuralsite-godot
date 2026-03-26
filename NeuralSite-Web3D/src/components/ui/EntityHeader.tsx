import { useSceneStore } from '../../core';
import { EntityIcon } from './EntityIcon';

export function EntityHeader({ nodeId }: { nodeId: string }) {
  const node = useSceneStore((s) => s.nodes[nodeId]);
  const clearSelection = useSceneStore((s) => s.clearSelection);
  
  if (!node) return null;
  
  return (
    <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800/50">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          node.type === 'road' ? 'bg-blue-600' : 
          node.type === 'bridge' ? 'bg-yellow-600' : 'bg-gray-600'
        }`}>
          <EntityIcon type={node.type} />
        </div>
        <div>
          <h2 className="text-white font-medium">{node.name}</h2>
          <p className="text-gray-400 text-xs capitalize">{node.type} • {node.phase}</p>
        </div>
      </div>
      <button
        onClick={clearSelection}
        className="text-gray-400 hover:text-white p-1"
      >
        ✕
      </button>
    </div>
  );
}
