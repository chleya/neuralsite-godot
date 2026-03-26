// DeleteTool - Delete selected entities
import { useEffect } from 'react';
import { useEditorStore } from '../../core/editor-store';
import { useSceneStore } from '../../core';

export function DeleteTool() {
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const setTool = useEditorStore((s) => s.setTool);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const deleteNode = useSceneStore((s) => s.deleteNode);
  const nodes = useSceneStore((s) => s.nodes);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTool('select');
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace' || e.key === 'd' || e.key === 'D') && selectedIds.length > 0) {
        e.preventDefault();
        
        // Delete all selected nodes
        for (const id of selectedIds) {
          deleteNode(id);
        }
        
        clearSelection();
        setTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, deleteNode, clearSelection, setTool]);

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-20 left-4 bg-red-600/90 backdrop-blur rounded-lg shadow-xl p-3 min-w-48">
      <div className="text-white font-medium mb-2">确认删除</div>
      <div className="text-gray-200 text-sm mb-3">
        确定要删除 {selectedIds.length} 个选中实体吗？
      </div>
      <div className="text-gray-400 text-xs mb-3">
        {selectedIds.map(id => nodes[id]?.name || id).join(', ')}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            for (const id of selectedIds) {
              deleteNode(id);
            }
            clearSelection();
            setTool('select');
          }}
          className="flex-1 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-400"
        >
          删除
        </button>
        <button
          onClick={() => setTool('select')}
          className="flex-1 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-500"
        >
          取消
        </button>
      </div>
      <div className="text-gray-400 text-xs mt-2 text-center">
        按 ESC 取消删除
      </div>
    </div>
  );
}
