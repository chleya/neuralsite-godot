// RoadTool - 3D road drawing tool using cursor position from store
import { useCallback, useEffect, useState, useRef } from 'react';
import { useEditorStore } from '../../core/editor-store';
import { useSceneStore } from '../../core/store';

type DrawState = 'idle' | 'placing_start' | 'placing_end' | 'preview';

interface Point2D {
  x: number;
  z: number;
}

interface RoadToolGlobalState {
  drawState: DrawState;
  startPoint: Point2D | null;
  endPoint: Point2D | null;
}

// Global state for road tool
let roadToolGlobal: RoadToolGlobalState = {
  drawState: 'idle',
  startPoint: null,
  endPoint: null,
};

let listeners: Array<(state: RoadToolGlobalState) => void> = [];

function notifyListeners() {
  listeners.forEach(l => l({ ...roadToolGlobal }));
}

function setRoadToolGlobal(newState: Partial<RoadToolGlobalState>) {
  roadToolGlobal = { ...roadToolGlobal, ...newState };
  notifyListeners();
}

function useRoadToolState() {
  const [state, setState] = useState<RoadToolGlobalState>(roadToolGlobal);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      listeners = listeners.filter(l => l !== setState);
    };
  }, []);

  return state;
}

export function useRoadTool() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setStatusMessage = useEditorStore((s) => s.setStatusMessage);
  const cursorPosition = useEditorStore((s) => s.cursorPosition);
  const createNode = useSceneStore((s) => s.createNode);
  const setLastPoint = useEditorStore((s) => s.setLastPoint);
  const lastPoint = useEditorStore((s) => s.lastPoint);
  const orthoEnabled = useEditorStore((s) => s.orthoEnabled);
  const distanceInput = useEditorStore((s) => s.distanceInput);
  const setDistanceInput = useEditorStore((s) => s.setDistanceInput);

  const constrainToOrtho = (point: Point2D): Point2D => {
    if (!orthoEnabled || !lastPoint) return point;
    
    const dx = point.x - lastPoint.x;
    const dz = point.z - lastPoint.z;
    
    if (Math.abs(dx) > Math.abs(dz)) {
      return { x: point.x, z: lastPoint.z };
    } else {
      return { x: lastPoint.x, z: point.z };
    }
  };

  const handleCanvasClick = useCallback(() => {
    if (activeTool !== 'road') return;
    
    let point: Point2D = { x: cursorPosition.x, z: cursorPosition.z };
    point = constrainToOrtho(point);

    switch (roadToolGlobal.drawState) {
      case 'idle':
        setLastPoint({ x: point.x, y: point.z, z: 0 });
        setRoadToolGlobal({ drawState: 'placing_end', startPoint: point });
        setStatusMessage('道路工具: 点击设置终点');
        break;

      case 'placing_end':
        setRoadToolGlobal({ drawState: 'preview', endPoint: point });
        setStatusMessage('道路工具: Enter确认 | ESC取消');
        break;

      case 'preview':
        setRoadToolGlobal({ endPoint: point });
        break;
    }
  }, [activeTool, cursorPosition.x, cursorPosition.z, setStatusMessage, orthoEnabled, lastPoint, setLastPoint]);

  const handleConfirm = useCallback(async () => {
    if (roadToolGlobal.drawState !== 'preview' || !roadToolGlobal.startPoint || !roadToolGlobal.endPoint) return;

    const { startPoint, endPoint } = roadToolGlobal;
    
    const stationStart = `K${Math.floor(Math.abs(startPoint.x) / 1000)}+${String(Math.floor(Math.abs(startPoint.x) % 1000)).padStart(3, '0')}`;
    const stationEnd = `K${Math.floor(Math.abs(endPoint.x) / 1000)}+${String(Math.floor(Math.abs(endPoint.x) % 1000)).padStart(3, '0')}`;

    const nodeId = `road_${Date.now()}`;

    await createNode({
      id: nodeId,
      type: 'road',
      name: `${stationStart} - ${stationEnd} 道路`,
      visible: true,
      stationRange: {
        start: { value: Math.abs(startPoint.x), formatted: stationStart },
        end: { value: Math.abs(endPoint.x), formatted: stationEnd },
      },
      width: 12,
      lanes: 4,
      elevation: 0,
      elevation_base: 0,
      lateral_offset: 0,
      phase: 'planning',
      progress: 0,
    } as any);

    setStatusMessage(`已创建道路: ${stationStart} - ${stationEnd}`);
    setRoadToolGlobal({ drawState: 'idle', startPoint: null, endPoint: null });
    setLastPoint(null);
  }, [createNode, setStatusMessage, setLastPoint]);

  const handleCancel = useCallback(() => {
    setRoadToolGlobal({ drawState: 'idle', startPoint: null, endPoint: null });
    setStatusMessage('道路工具已取消');
    setLastPoint(null);
  }, [setStatusMessage, setLastPoint]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTool !== 'road') return;

      if (e.key === 'Enter') {
        handleConfirm();
      } else if (e.key === 'Escape') {
        handleCancel();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (roadToolGlobal.drawState === 'placing_end') {
          setDistanceInput('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, handleConfirm, handleCancel, setDistanceInput]);

  useEffect(() => {
    if (activeTool !== 'road') return;
    
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      const timeoutId = setTimeout(() => {
        const retryCanvas = document.querySelector('canvas');
        if (retryCanvas) {
          retryCanvas.addEventListener('click', handleCanvasClick);
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }

    canvas.addEventListener('click', handleCanvasClick);
    return () => canvas.removeEventListener('click', handleCanvasClick);
  }, [activeTool, handleCanvasClick]);

  return { handleConfirm, handleCancel };
}

export function RoadToolStatus() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const state = useRoadToolState();
  useRoadTool(); // 注册画布点击监听器

  if (activeTool !== 'road') return null;

  const getLength = () => {
    if (!state.startPoint || !state.endPoint) return '0';
    const dx = state.endPoint.x - state.startPoint.x;
    const dz = state.endPoint.z - state.startPoint.z;
    return Math.sqrt(dx * dx + dz * dz).toFixed(1);
  };

  return (
    <div className="absolute top-20 left-4 bg-gray-800/95 backdrop-blur rounded-lg shadow-xl px-4 py-3 text-sm z-10">
      <div className="text-gray-400 mb-1">
        {state.drawState === 'idle' && '道路工具 - 点击画布设置起点'}
        {state.drawState === 'placing_start' && '设置起点中...'}
        {state.drawState === 'placing_end' && '道路工具 - 点击画布设置终点'}
        {state.drawState === 'preview' && '预览模式'}
      </div>
      {state.startPoint && (
        <div className="text-white">
          <div>起点: X: {state.startPoint.x.toFixed(1)} Z: {state.startPoint.z.toFixed(1)}</div>
        </div>
      )}
      {state.endPoint && (
        <div className="text-white">
          <div>终点: X: {state.endPoint.x.toFixed(1)} Z: {state.endPoint.z.toFixed(1)}</div>
        </div>
      )}
      {state.startPoint && state.endPoint && (
        <div className="text-blue-400 font-medium mt-1">
          长度: {getLength()} m
        </div>
      )}
      <div className="mt-2 text-xs text-gray-500">
        点击画布放置 | Enter 确认 | ESC 取消
      </div>
    </div>
  );
}
