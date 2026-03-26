import { useState } from 'react';
import { useEditorStore } from '../../core/editor-store';

type ViewMode = '3d' | 'top' | 'side';

export function ViewModeSwitcher() {
  const [isExpanded, setIsExpanded] = useState(false);
  const viewMode = useEditorStore((s) => s.viewMode);
  const setViewMode = useEditorStore((s) => s.setViewMode);

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    setIsExpanded(false);
  };

  const viewConfigs = {
    '3d': { label: '3D视图', icon: '🎮', description: '三维视图' },
    'top': { label: '平面图', icon: '📐', description: '俯视图 (XY)' },
    'side': { label: '立面图', icon: '📊', description: '侧视图 (XZ)' },
  };

  const current = viewConfigs[viewMode];

  return (
    <div className="absolute top-4 right-4 z-20">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gray-800/95 backdrop-blur rounded-lg shadow-xl px-3 py-2 flex items-center gap-2 hover:bg-gray-700 transition-colors"
          title="视图模式"
        >
          <span className="text-lg">{current.icon}</span>
          <span className="text-white text-sm font-medium">{current.label}</span>
        </button>
      ) : (
        <div className="bg-gray-800/95 backdrop-blur rounded-lg shadow-xl p-2 flex gap-1">
          {Object.entries(viewConfigs).map(([key, config]) => (
            <button
              key={key}
              onClick={() => handleViewChange(key as ViewMode)}
              className={`px-3 py-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${
                viewMode === key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
              title={config.description}
            >
              <span className="text-lg">{config.icon}</span>
              <span className="text-xs">{config.label}</span>
            </button>
          ))}
          <button
            onClick={() => setIsExpanded(false)}
            className="ml-2 px-2 py-2 text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}