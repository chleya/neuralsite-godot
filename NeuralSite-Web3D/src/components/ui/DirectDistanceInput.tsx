import { useEffect, useRef } from 'react';
import { useEditorStore } from '../../core/editor-store';

export function DirectDistanceInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const distanceInput = useEditorStore((s) => s.distanceInput);
  const setDistanceInput = useEditorStore((s) => s.setDistanceInput);
  const lastPoint = useEditorStore((s) => s.lastPoint);
  const cursorPosition = useEditorStore((s) => s.cursorPosition);
  const activeTool = useEditorStore((s) => s.activeTool);
  
  const isDrawing = activeTool === 'road' || activeTool === 'bridge';
  
  const getDistance = () => {
    if (!lastPoint) return 0;
    const dx = cursorPosition.x - lastPoint.x;
    const dz = cursorPosition.z - lastPoint.z;
    return Math.sqrt(dx * dx + dz * dz);
  };
  
  useEffect(() => {
    if (distanceInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [distanceInput]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && distanceInput) {
      const distance = parseFloat(distanceInput);
      if (!isNaN(distance) && lastPoint) {
        const angle = Math.atan2(cursorPosition.z - lastPoint.z, cursorPosition.x - lastPoint.x);
        const newX = lastPoint.x + distance * Math.cos(angle);
        const newZ = lastPoint.y + distance * Math.sin(angle);
        useEditorStore.getState().setCursorPosition({ x: newX, y: 0, z: newZ });
      }
      setDistanceInput(null);
    } else if (e.key === 'Escape') {
      setDistanceInput(null);
    }
  };
  
  if (!isDrawing || !lastPoint) return null;
  
  const distance = getDistance();
  
  return (
    <div className="absolute top-20 right-4 bg-gray-900/95 backdrop-blur border border-gray-700 rounded-lg shadow-xl p-3 z-30">
      <div className="text-xs text-gray-400 mb-1">距离</div>
      <div className="text-2xl font-bold text-cyan-400 font-mono">
        {distance.toFixed(2)}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {lastPoint && `从 (${lastPoint.x.toFixed(0)}, ${lastPoint.z.toFixed(0)})`}
      </div>
      
      {distanceInput !== null && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <input
            ref={inputRef}
            type="number"
            value={distanceInput}
            onChange={(e) => setDistanceInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入距离..."
            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm outline-none focus:border-cyan-500"
            step="0.1"
          />
          <div className="text-xs text-gray-500 mt-1">按 Enter 确认，ESC 取消</div>
        </div>
      )}
      
      <div className="text-xs text-gray-600 mt-2">
        按 Tab 键输入精确距离
      </div>
    </div>
  );
}
