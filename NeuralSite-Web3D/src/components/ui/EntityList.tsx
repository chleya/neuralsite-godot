import { useState, useCallback, useMemo } from 'react';
import { useSceneStore } from '../../core';
import type { ConstructionPhase } from '../../core';
import { EntityIcon } from './EntityIcon';
import { QuickProgressInput, IssueRegistration } from './QuickActions';
import { StationRangeInput } from './StationInput';
import { ConfirmDialog } from './ModernUI';

const PHASE_COLORS: Record<ConstructionPhase, string> = {
  planning: '#4A90D9',
  clearing: '#FFB84D',
  earthwork: '#996633',
  pavement: '#666666',
  finishing: '#66CC66',
  completed: '#333333',
};

const PHASE_NAMES: Record<ConstructionPhase, string> = {
  planning: '规划',
  clearing: '清表',
  earthwork: '土方',
  pavement: '路面',
  finishing: '收尾',
  completed: '完成',
};

interface EntityListProps {
  onAddEntity: () => void;
}

export function EntityList({ onAddEntity }: EntityListProps) {
  const nodes = useSceneStore((s) => s.nodes);
  const rootNodeIds = useSceneStore((s) => s.rootNodeIds);
  const setSelection = useSceneStore((s) => s.setSelection);
  const selection = useSceneStore((s) => s.selection);
  const loadEntityHistory = useSceneStore((s) => s.loadEntityHistory);
  const deleteNode = useSceneStore((s) => s.deleteNode);
  const loadFromAPI = useSceneStore((s) => s.loadFromAPI);
  const addNotification = useSceneStore((s) => s.addNotification);

  const [searchQuery, setSearchQuery] = useState('');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState<'quality' | 'safety' | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSelect = useCallback((id: string) => {
    setSelection({ nodeId: id, nodeType: nodes[id]?.type || null, position: null });
    loadEntityHistory(id);
  }, [setSelection, nodes, loadEntityHistory]);

  const filteredIds = useMemo(() => {
    if (!searchQuery.trim()) return rootNodeIds;
    const q = searchQuery.toLowerCase();
    return rootNodeIds.filter((id) => {
      const node = nodes[id];
      if (!node) return false;
      const matchName = node.name?.toLowerCase().includes(q);
      const matchStation = 'stationRange' in node && (
        node.stationRange?.start?.formatted?.toLowerCase().includes(q) ||
        node.stationRange?.end?.formatted?.toLowerCase().includes(q)
      );
      return matchName || matchStation;
    });
  }, [rootNodeIds, nodes, searchQuery]);

  const selectedNode = selection.nodeId ? nodes[selection.nodeId] : null;

  if (rootNodeIds.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
        <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center text-4xl mb-4">
          📦
        </div>
        <p className="mb-4 text-center">暂无实体</p>
        <button
          onClick={onAddEntity}
          className="btn btn-primary"
        >
          添加第一个实体
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
        <div>
          <h2 className="text-lg font-semibold text-white">实体列表</h2>
          <p className="text-slate-400 text-sm">{filteredIds.length} / {rootNodeIds.length} 个实体</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setIsRefreshing(true);
              await loadFromAPI();
              setIsRefreshing(false);
              addNotification({ type: 'info', message: '已刷新', duration: 2000 });
            }}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <span>{isRefreshing ? '⟳' : '↻'}</span> 刷新
          </button>
          <button
            onClick={onAddEntity}
            className="btn btn-primary text-sm flex items-center gap-1"
          >
            <span>+</span> 添加
          </button>
        </div>
      </div>
      
      {/* Search */}
      <div className="p-4 pb-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索名称或桩号..."
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Quick Actions for selected entity */}
      {selectedNode && (
        <div className="p-4 pb-0">
          <div className="bg-gray-700/50 rounded-lg p-3 space-y-2">
            <div className="text-xs text-gray-400">快捷操作</div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowProgressModal(true)}
                className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
              >
                📊 填进度
              </button>
              <button
                onClick={() => setShowIssueModal('quality')}
                className="flex-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white text-xs rounded transition-colors"
              >
                🔍 质量问题
              </button>
              <button
                onClick={() => setShowIssueModal('safety')}
                className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded transition-colors"
              >
                ⚠️ 安全问题
              </button>
              <button
                onClick={() => selectedNode && setDeleteConfirm({ id: selectedNode.id, name: selectedNode.name })}
                className="flex-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded transition-colors"
              >
                🗑️ 删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      {showProgressModal && selectedNode && (
        <QuickProgressInput
          entityId={selectedNode.id}
          entityName={selectedNode.name}
          currentProgress={selectedNode.progress}
          onClose={() => setShowProgressModal(false)}
        />
      )}

      {/* Issue Modal */}
      {showIssueModal && selectedNode && (
        <IssueRegistration
          entityId={selectedNode.id}
          entityName={selectedNode.name}
          issueType={showIssueModal}
          onClose={() => setShowIssueModal(null)}
        />
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredIds.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <div>暂无实体</div>
            <button
              onClick={onAddEntity}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
            >
              创建第一个实体
            </button>
          </div>
        )}
        {filteredIds.map((id) => {
          const node = nodes[id];
          if (!node) return null;
          const isSelected = selection.nodeId === id;
          
          const phaseColor = PHASE_COLORS[node.phase] || '#888888';
          
          return (
            <div
              key={id}
              className={`p-4 rounded-xl cursor-pointer transition-all hover-lift ${
                isSelected 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/25 ring-2 ring-blue-400' 
                  : 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600'
              }`}
              onClick={() => handleSelect(id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  isSelected ? 'bg-white/20' : 'bg-slate-700/50'
                }`}>
                  <EntityIcon type={node.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{node.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${isSelected ? 'bg-white/20 text-white' : 'badge-gray'}`}>
                      {node.type}
                    </span>
                    <span style={{ color: phaseColor }} className="text-xs">
                      {PHASE_NAMES[node.phase] || node.phase}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-white">{(node.progress * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3">
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${node.progress * 100}%`,
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.9)' : phaseColor,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title="确认删除实体"
        message={`确定要删除 "${deleteConfirm?.name}" 吗？此操作可将实体移至回收站，支持恢复。`}
        confirmLabel="删除"
        cancelLabel="取消"
        variant="danger"
        onConfirm={async () => {
          if (deleteConfirm) {
            const result = await deleteNode(deleteConfirm.id);
            if (result.success) {
              addNotification({ type: 'success', message: '实体已删除', duration: 3000 });
              setSelection({ nodeId: null, nodeType: null, position: null });
            } else {
              addNotification({ type: 'error', message: result.error || '删除失败', duration: 5000 });
            }
          }
          setDeleteConfirm(null);
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
