import { useEffect, useRef } from 'react';
import { useEditorStore } from '../../core/editor-store';
import { useSceneStore } from '../../core/store';

export function SelectionBox() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const selectionStart = useEditorStore((s) => s.selectionStart);
  const selectionEnd = useEditorStore((s) => s.selectionEnd);
  const selectionMode = useEditorStore((s) => s.selectionMode);
  const setSelectedIds = useEditorStore((s) => s.setSelectedIds);
  const nodes = useSceneStore((s) => s.nodes);
  const rootNodeIds = useSceneStore((s) => s.rootNodeIds);
  
  const isSelecting = selectionStart !== null && selectionEnd !== null && selectionMode === 'window';
  
  const getBoxStyle = () => {
    if (!selectionStart || !selectionEnd) return {};
    
    const left = Math.min(selectionStart.x, selectionEnd.x);
    const top = Math.min(selectionStart.y, selectionEnd.y);
    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);
    
    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  };
  
  useEffect(() => {
    if (!isSelecting || !selectionStart || !selectionEnd) return;
    
    const left = Math.min(selectionStart.x, selectionEnd.x);
    const right = Math.max(selectionStart.x, selectionEnd.x);
    const top = Math.min(selectionStart.y, selectionEnd.y);
    const bottom = Math.max(selectionStart.y, selectionEnd.y);
    
    const isWindow = selectionEnd.x >= selectionStart.x && selectionEnd.y >= selectionStart.y;
    
    const selected: string[] = [];
    
    rootNodeIds.forEach((id) => {
      const node = nodes[id];
      if (!node) return;
      
      if ('stationRange' in node) {
        const stationX = node.stationRange.start.value / 1000;
        const lateral = (node as any).lateral_offset || 0;
        
        const nodeLeft = stationX;
        const nodeRight = node.stationRange.end.value / 1000;
        const nodeTop = lateral - 5;
        const nodeBottom = lateral + 5;
        
        let intersects = false;
        
        if (isWindow) {
          intersects = nodeLeft >= left && nodeRight <= right && nodeTop >= top && nodeBottom <= bottom;
        } else {
          intersects = !(nodeRight < left || nodeLeft > right || nodeBottom < top || nodeTop > bottom);
        }
        
        if (intersects) {
          selected.push(id);
        }
      }
    });
    
    if (selectionEnd.x !== selectionStart.x || selectionEnd.y !== selectionStart.y) {
      setSelectedIds(selected);
    }
  }, [isSelecting, selectionStart, selectionEnd, rootNodeIds, nodes, setSelectedIds]);
  
  if (!isSelecting) return null;
  
  return (
    <div
      ref={canvasRef}
      className="absolute pointer-events-none z-40"
      style={{
        ...getBoxStyle(),
        border: '2px dashed #3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      }}
    >
      <div className="absolute -top-5 left-0 text-xs text-blue-400 bg-gray-900/80 px-1 rounded">
        {selectionMode === 'window' ? '窗口选择' : '交叉选择'}: {Math.abs((selectionEnd?.x || 0) - (selectionStart?.x || 0)).toFixed(0)} x {Math.abs((selectionEnd?.y || 0) - (selectionStart?.y || 0)).toFixed(0)}
      </div>
    </div>
  );
}
