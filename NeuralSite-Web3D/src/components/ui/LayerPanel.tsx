import { useState, useMemo } from 'react';
import { useSceneStore } from '../../core/store';

export function LayerPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const nodes = useSceneStore((s) => s.nodes);
  const rootNodeIds = useSceneStore((s) => s.rootNodeIds);
  const layerVisibility = useSceneStore((s) => s.layerVisibility);
  const toggleLayerVisibility = useSceneStore((s) => s.toggleLayerVisibility);

  const layers = useMemo(() => {
    const counts: Record<string, number> = {};
    const typeColors: Record<string, string> = {
      road: '#3b82f6',
      bridge: '#f59e0b',
      culvert: '#10b981',
      fence: '#8b5cf6',
      sign: '#ec4899',
    };

    rootNodeIds.forEach((id) => {
      const node = nodes[id];
      if (!node) return;
      const layerId = node.type || 'unknown';
      counts[layerId] = (counts[layerId] || 0) + 1;
    });

    return Object.entries(counts).map(([type, count]) => ({
      id: type,
      name: type === 'road' ? '道路' :
            type === 'bridge' ? '桥梁' :
            type === 'culvert' ? '涵洞' :
            type === 'fence' ? '围挡' :
            type === 'sign' ? '标识' : type,
      visible: layerVisibility[type] !== false,
      count,
      color: typeColors[type] || '#6b7280',
    }));
  }, [nodes, rootNodeIds, layerVisibility]);

  const toggleAll = (visible: boolean) => {
    layers.forEach((layer) => {
      if ((layerVisibility[layer.id] !== false) !== visible) {
        toggleLayerVisibility(layer.id);
      }
    });
  };

  if (!isExpanded) {
    return (
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gray-800/95 backdrop-blur rounded-lg shadow-xl p-2 flex items-center gap-2 hover:bg-gray-700 transition-colors"
          title="图层面板"
        >
          <span className="text-lg">📑</span>
          <span className="text-white text-sm font-medium">图层</span>
          <span className="text-gray-400 text-xs">({layers.length})</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-20 w-64">
      <div className="bg-gray-800/95 backdrop-blur rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2 bg-gray-900/50 flex items-center justify-between border-b border-gray-700">
          <span className="text-white text-sm font-medium">图层</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleAll(true)}
              className="text-xs text-gray-400 hover:text-white"
            >
              全部显示
            </button>
            <button
              onClick={() => toggleAll(false)}
              className="text-xs text-gray-400 hover:text-white"
            >
              全部隐藏
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Layer List */}
        <div className="max-h-64 overflow-y-auto">
          {layers.length === 0 ? (
            <div className="px-3 py-4 text-center text-gray-500 text-sm">
              暂无图层
            </div>
          ) : (
            layers.map((layer) => (
              <div
                key={layer.id}
                className="px-3 py-2 flex items-center justify-between hover:bg-gray-700/50 cursor-pointer"
                onClick={() => toggleLayerVisibility(layer.id)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: layer.color, opacity: layer.visible ? 1 : 0.3 }}
                  />
                  <span
                    className={`text-sm ${layer.visible ? 'text-white' : 'text-gray-500'}`}
                  >
                    {layer.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${layer.visible ? 'text-gray-400' : 'text-gray-600'}`}>
                    {layer.count}
                  </span>
                  <div
                    className={`w-8 h-5 rounded-full transition-colors flex items-center ${
                      layer.visible ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                        layer.visible ? 'translate-x-3.5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
