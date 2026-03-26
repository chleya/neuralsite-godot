// ToolManager - Full CAD tool system with keyboard shortcuts
import { useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '../../core/editor-store';
import { useSceneStore } from '../../core/store';
import type { Tool } from '../../core/editor-store';
import { MoveTool } from './move-tool';

const LAYER_CONFIG: Record<string, { label: string; color: string }> = {
  road: { label: '道路', color: '#4A90D9' },
  bridge: { label: '桥梁', color: '#996633' },
  vehicle: { label: '车辆', color: '#66CC66' },
  safety_sign: { label: '安全标识', color: '#FFB84D' },
  fence: { label: '围挡', color: '#888888' },
};

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
}

export function ToolManager() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setTool = useEditorStore((s) => s.setTool);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const rotateBy = useEditorStore((s) => s.rotateBy);
  const selectAll = useEditorStore((s) => s.selectAll);
  const rootNodeIds = useSceneStore((s) => s.rootNodeIds);
  const statusMessage = useEditorStore((s) => s.statusMessage);
  const setStatusMessage = useEditorStore((s) => s.setStatusMessage);
  const snapToGrid = useEditorStore((s) => s.snapToGrid);
  const toggleGridSnap = useEditorStore((s) => s.toggleGridSnap);
  const showGrid = useEditorStore((s) => s.showGrid);
  const toggleGrid = useEditorStore((s) => s.toggleGrid);
  const gridSize = useEditorStore((s) => s.gridSize);
  const setGridSize = useEditorStore((s) => s.setGridSize);
  const deleteNode = useSceneStore((s) => s.deleteNode);
  const copySelected = useEditorStore((s) => s.copySelected);
  const nodes = useSceneStore((s) => s.nodes);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0 });
  const [gridSizeInput, setGridSizeInput] = useState(gridSize.toString());

  const handleCopy = useCallback(() => {
    if (selectedIds.length === 0) return;
    const ids = [...selectedIds];
    setStatusMessage(`已复制 ${ids.length} 个对象到剪贴板`);
  }, [selectedIds, setStatusMessage]);

  const handlePaste = useCallback(() => {
    setStatusMessage('粘贴 - 请在3D视图中点击选择位置');
  }, [setStatusMessage]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

      const key = e.key.toLowerCase();

      // Escape - cancel/deselect
      if (key === 'escape') {
        clearSelection();
        setTool('select');
        return;
      }

      // Ctrl+A - Select all
      if (e.ctrlKey && key === 'a') {
        e.preventDefault();
        selectAll(rootNodeIds);
        return;
      }

      // Ctrl+C - Copy
      if (e.ctrlKey && key === 'c') {
        e.preventDefault();
        handleCopy();
        return;
      }

      // Ctrl+D - Duplicate selected
      if (e.ctrlKey && key === 'd') {
        e.preventDefault();
        if (selectedIds.length > 0) {
          selectedIds.forEach(id => {
            const copyNode = useSceneStore.getState().copyNode;
            copyNode(id);
          });
        }
        return;
      }

      // Ctrl+V - Paste
      if (e.ctrlKey && key === 'v') {
        e.preventDefault();
        handlePaste();
        return;
      }

      // Ctrl+Z - Undo
      if (e.ctrlKey && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const undo = useSceneStore.getState().undo;
        undo();
        return;
      }

      // Ctrl+Shift+Z or Ctrl+Y - Redo
      if ((e.ctrlKey && key === 'z' && e.shiftKey) || (e.ctrlKey && key === 'y')) {
        e.preventDefault();
        const redo = useSceneStore.getState().redo;
        redo();
        return;
      }

      // Delete / Backspace
      if (key === 'delete' || key === 'backspace') {
        if (selectedIds.length > 0) {
          selectedIds.forEach(id => deleteNode(id));
          clearSelection();
          setStatusMessage(`已删除 ${selectedIds.length} 个对象`);
        }
        return;
      }

      // Tool shortcuts
      switch (key) {
        case 'v':
          setTool('select');
          break;
        case 'm':
          if (selectedIds.length > 0) setTool('move');
          else setStatusMessage('请先选择对象');
          break;
        case 'c':
          if (selectedIds.length > 0) setTool('copy');
          else setStatusMessage('请先选择对象');
          break;
        case 'r':
          if (selectedIds.length > 0) setTool('rotate');
          else setStatusMessage('请先选择对象');
          break;
        case 'o':
          if (selectedIds.length > 0) setTool('offset');
          else setStatusMessage('请先选择对象');
          break;
        case 'd':
          setTool('delete');
          break;
        case 's':
          if (selectedIds.length > 0) setTool('scale');
          else setStatusMessage('请先选择对象');
          break;
        case 'x':
          if (selectedIds.length > 0) setTool('mirror');
          else setStatusMessage('请先选择对象');
          break;
        case 'f':
          setTool('pan');
          break;
        case 'z':
          if (!e.ctrlKey) setTool('zoom');
          break;
        case 'g':
          toggleGridSnap();
          setStatusMessage(snapToGrid ? '网格捕捉已关闭' : '网格捕捉已开启');
          break;
        case 'w':
          toggleGrid();
          setStatusMessage(showGrid ? '网格已隐藏' : '网格已显示');
          break;
        case 'k':
          setTool('road');
          break;
        case 'b':
          setTool('bridge');
          break;
        case 'n':
          setTool('fence');
          break;
        case 'i':
          setTool('sign');
          break;
        case '[':
          rotateBy(-Math.PI / 8);
          break;
        case ']':
          rotateBy(Math.PI / 8);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, rootNodeIds, clearSelection, setTool, rotateBy, selectAll, handleCopy, handlePaste, deleteNode, setStatusMessage, toggleGridSnap, toggleGrid, snapToGrid, showGrid]);

  // Right-click context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      
      const target = e.target as HTMLElement;
      if (target.tagName === 'CANVAS') {
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
      }
    };

    const handleClick = () => {
      if (contextMenu.visible) {
        setContextMenu({ visible: false, x: 0, y: 0 });
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleClick);
    };
  }, [contextMenu.visible]);

  // Render active tool
  switch (activeTool) {
    case 'move':
      return <MoveTool />;
    case 'pan':
    case 'zoom':
      return null;
    default:
      return null;
  }
}

// Context Menu Component
function ContextMenu({ x, y, onClose }: { x: number; y: number; onClose: () => void }) {
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const setTool = useEditorStore((s) => s.setTool);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const deleteNode = useSceneStore((s) => s.deleteNode);
  const setStatusMessage = useEditorStore((s) => s.setStatusMessage);

  const handleDelete = () => {
    selectedIds.forEach(id => deleteNode(id));
    clearSelection();
    setStatusMessage(`已删除 ${selectedIds.length} 个对象`);
    onClose();
  };

  return (
    <div
      className="fixed bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1 min-w-[160px] z-50"
      style={{ left: x, top: y }}
    >
      <MenuItem label="复制" shortcut="Ctrl+C" icon="📋" disabled={selectedIds.length === 0} />
      <MenuItem label="粘贴" shortcut="Ctrl+V" icon="📄" disabled />
      <MenuItem label="剪切" shortcut="Ctrl+X" icon="✂️" disabled={selectedIds.length === 0} />
      <div className="h-px bg-gray-600 my-1" />
      <MenuItem label="移动" shortcut="M" icon="↔️" onClick={() => { setTool('move'); onClose(); }} disabled={selectedIds.length === 0} />
      <MenuItem label="旋转" shortcut="R" icon="🔄" onClick={() => { setTool('rotate'); onClose(); }} disabled={selectedIds.length === 0} />
      <MenuItem label="复制" shortcut="C" icon="⧉" onClick={() => { setTool('copy'); onClose(); }} disabled={selectedIds.length === 0} />
      <MenuItem label="偏移" shortcut="O" icon="≋" onClick={() => { setTool('offset'); onClose(); }} disabled={selectedIds.length === 0} />
      <MenuItem label="缩放" shortcut="S" icon="⤡" onClick={() => { setTool('scale'); onClose(); }} disabled={selectedIds.length === 0} />
      <MenuItem label="镜像" shortcut="X" icon="◐" onClick={() => { setTool('mirror'); onClose(); }} disabled={selectedIds.length === 0} />
      <div className="h-px bg-gray-600 my-1" />
      <MenuItem label="删除" shortcut="Del" icon="🗑️" onClick={handleDelete} disabled={selectedIds.length === 0} />
      <div className="h-px bg-gray-600 my-1" />
      <MenuItem label="全选" shortcut="Ctrl+A" icon="☑️" onClick={() => { /* selectAll */ onClose(); }} />
      <MenuItem label="取消选择" shortcut="Esc" icon="☐" onClick={() => { clearSelection(); onClose(); }} />
    </div>
  );
}

function MenuItem({ label, shortcut, icon, onClick, disabled }: { 
  label: string; 
  shortcut?: string; 
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 ${
        disabled 
          ? 'text-gray-500 cursor-not-allowed' 
          : 'text-gray-200 hover:bg-gray-700'
      }`}
    >
      {icon && <span className="w-5 text-center">{icon}</span>}
      <span className="flex-1">{label}</span>
      {shortcut && <span className="text-xs text-gray-500">{shortcut}</span>}
    </button>
  );
}

// Toolbar component - full CAD toolbar
export function Toolbar() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setTool = useEditorStore((s) => s.setTool);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const snapToGrid = useEditorStore((s) => s.snapToGrid);
  const toggleGridSnap = useEditorStore((s) => s.toggleGridSnap);
  const showGrid = useEditorStore((s) => s.showGrid);
  const toggleGrid = useEditorStore((s) => s.toggleGrid);
  const gridSize = useEditorStore((s) => s.gridSize);
  const setGridSize = useEditorStore((s) => s.setGridSize);
  const orthoEnabled = useEditorStore((s) => s.orthoEnabled);
  const toggleOrtho = useEditorStore((s) => s.toggleOrtho);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const toggleSnap = useEditorStore((s) => s.toggleSnap);
  const [gridSizeInput, setGridSizeInput] = useState(gridSize.toString());
  const [showGridDropdown, setShowGridDropdown] = useState(false);

  const tools: { id: Tool; label: string; shortcut: string; group?: string }[] = [
    { id: 'select', label: '选择', shortcut: 'V', group: 'view' },
    { id: 'pan', label: '平移', shortcut: 'F', group: 'view' },
    { id: 'zoom', label: '缩放', shortcut: 'Z', group: 'view' },
    { id: 'move', label: '移动', shortcut: 'M', group: 'edit' },
    { id: 'rotate', label: '旋转', shortcut: 'R', group: 'edit' },
    { id: 'copy', label: '复制', shortcut: 'C', group: 'edit' },
    { id: 'offset', label: '偏移', shortcut: 'O', group: 'edit' },
    { id: 'scale', label: '缩放', shortcut: 'S', group: 'edit' },
    { id: 'mirror', label: '镜像', shortcut: 'X', group: 'edit' },
    { id: 'delete', label: '删除', shortcut: 'D', group: 'edit' },
    { id: 'road', label: '道路', shortcut: 'K', group: 'create' },
    { id: 'bridge', label: '桥梁', shortcut: 'B', group: 'create' },
    { id: 'fence', label: '围挡', shortcut: 'N', group: 'create' },
    { id: 'sign', label: '标识', shortcut: 'G', group: 'create' },
  ];

  const handleGridSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGridSizeInput(e.target.value);
  };

  const handleGridSizeBlur = () => {
    const size = parseFloat(gridSizeInput);
    if (!isNaN(size) && size > 0) {
      setGridSize(size);
    } else {
      setGridSizeInput(gridSize.toString());
    }
    setShowGridDropdown(false);
  };

  const viewTools = tools.filter(t => t.group === 'view');
  const editTools = tools.filter(t => t.group === 'edit');
  const createTools = tools.filter(t => t.group === 'create');

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2">
      {/* Layer panel */}
      <LayerPanel />
      
      {/* Main toolbar */}
      <div className="bg-gray-800/95 backdrop-blur rounded-lg shadow-xl p-1 flex gap-1">
        <div className="flex gap-1">
          {viewTools.map((tool) => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setTool(tool.id)}
                title={`${tool.label} (${tool.shortcut})`}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <ToolIcon tool={tool.id} />
              </button>
            );
          })}
        </div>
        
        <div className="w-px bg-gray-600 mx-1" />
        
        <div className="flex gap-1">
          {editTools.map((tool) => {
            const isActive = activeTool === tool.id;
            const isDisabled = selectedIds.length === 0 && tool.id !== 'delete';
            return (
              <button
                key={tool.id}
                onClick={() => setTool(tool.id)}
                disabled={isDisabled}
                title={`${tool.label} (${tool.shortcut})`}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : isDisabled
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <ToolIcon tool={tool.id} />
              </button>
            );
          })}
        </div>

        <div className="w-px bg-gray-600 mx-1" />

        <div className="flex gap-1">
          {createTools.map((tool) => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setTool(tool.id)}
                title={`${tool.label} (${tool.shortcut})`}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <ToolIcon tool={tool.id} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid controls */}
      <div className="bg-gray-800/95 backdrop-blur rounded-lg shadow-xl p-2 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={toggleSnap}
            title={`对象捕捉 ${snapEnabled ? '开' : '关'} (F3)`}
            className={`w-8 h-8 flex items-center justify-center rounded ${
              snapEnabled ? 'bg-cyan-600 text-white' : 'text-gray-500 hover:bg-gray-700'
            }`}
          >
            ⊕
          </button>
          <button
            onClick={toggleOrtho}
            title={`正交模式 ${orthoEnabled ? '开' : '关'} (F8)`}
            className={`w-8 h-8 flex items-center justify-center rounded ${
              orthoEnabled ? 'bg-cyan-600 text-white' : 'text-gray-500 hover:bg-gray-700'
            }`}
          >
            +
          </button>
          <div className="w-px bg-gray-600 mx-1" />
          <button
            onClick={toggleGridSnap}
            title={`网格捕捉 ${snapToGrid ? '开' : '关'} (G)`}
            className={`w-8 h-8 flex items-center justify-center rounded ${
              snapToGrid ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <GridIcon />
          </button>
          <button
            onClick={toggleGrid}
            title={`网格显示 ${showGrid ? '开' : '关'} (W)`}
            className={`w-8 h-8 flex items-center justify-center rounded ${
              showGrid ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            ▦
          </button>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowGridDropdown(!showGridDropdown)}
            className="text-gray-300 text-sm px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
          >
            {gridSize}
          </button>
          
          {showGridDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg p-2 shadow-xl z-50">
              <label className="text-xs text-gray-400 block mb-1">网格尺寸</label>
              <input
                type="number"
                value={gridSizeInput}
                onChange={handleGridSizeChange}
                onBlur={handleGridSizeBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleGridSizeBlur()}
                className="w-20 px-2 py-1 bg-gray-700 text-white text-sm rounded"
                step={0.5}
                min={0.1}
              />
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          {selectedIds.length > 0 ? `已选 ${selectedIds.length} 个` : '未选择'}
        </div>
      </div>
    </div>
  );
}

// Tool icons as simple Unicode/text
function ToolIcon({ tool }: { tool: Tool }) {
  const icons: Record<Tool, string> = {
    select: '⬚',
    move: '↔',
    rotate: '↻',
    copy: '⧉',
    delete: '✕',
    offset: '≋',
    mirror: '◐',
    scale: '⤡',
    pan: '✋',
    zoom: '🔍',
    road: '═',
    bridge: '⛰',
    fence: '▭',
    sign: '⚠',
  };
  return <span className="text-lg">{icons[tool]}</span>;
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="0" y="0" width="4" height="4" />
      <rect x="6" y="0" width="4" height="4" />
      <rect x="12" y="0" width="4" height="4" />
      <rect x="0" y="6" width="4" height="4" />
      <rect x="6" y="6" width="4" height="4" />
      <rect x="12" y="6" width="4" height="4" />
      <rect x="0" y="12" width="4" height="4" />
      <rect x="6" y="12" width="4" height="4" />
      <rect x="12" y="12" width="4" height="4" />
    </svg>
  );
}

// Layer Panel Component
function LayerPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const layerVisibility = useSceneStore((s) => s.layerVisibility);
  const toggleLayerVisibility = useSceneStore((s) => s.toggleLayerVisibility);
  const nodes = useSceneStore((s) => s.nodes);

  const layerCounts = Object.keys(LAYER_CONFIG).reduce((acc, layerType) => {
    acc[layerType] = Object.values(nodes).filter(n => n.type === layerType).length;
    return acc;
  }, {} as Record<string, number>);

  const visibleCount = Object.values(layerVisibility).filter(v => v).length;
  const totalCount = Object.keys(LAYER_CONFIG).length;

  return (
    <div className="bg-gray-800/95 backdrop-blur rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-300 text-sm font-medium">图层</span>
          <span className="text-xs text-gray-500">({visibleCount}/{totalCount})</span>
        </div>
        <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Layer list */}
      {isExpanded && (
        <div className="border-t border-gray-700 py-1">
          {Object.entries(LAYER_CONFIG).map(([layerType, config]) => {
            const isVisible = layerVisibility[layerType] ?? true;
            const count = layerCounts[layerType] || 0;
            
            return (
              <button
                key={layerType}
                onClick={() => toggleLayerVisibility(layerType)}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-gray-700/50 transition-colors"
              >
                <div
                  className={`w-3 h-3 rounded-sm border ${
                    isVisible ? 'border-transparent' : 'border-gray-500'
                  }`}
                  style={{
                    backgroundColor: isVisible ? config.color : 'transparent',
                  }}
                />
                <span className={`flex-1 text-left text-sm ${
                  isVisible ? 'text-gray-200' : 'text-gray-500'
                }`}>
                  {config.label}
                </span>
                <span className={`text-xs ${
                  isVisible ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Status bar component
export function StatusBar() {
  const cursorPosition = useEditorStore((s) => s.cursorPosition);
  const statusMessage = useEditorStore((s) => s.statusMessage);
  const snapToGrid = useEditorStore((s) => s.snapToGrid);
  const gridSize = useEditorStore((s) => s.gridSize);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const activeTool = useEditorStore((s) => s.activeTool);
  const orthoEnabled = useEditorStore((s) => s.orthoEnabled);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-gray-800/95 backdrop-blur rounded-lg shadow-xl px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm">{statusMessage}</span>
      </div>
      
      <div className="flex items-center gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <span className="text-gray-500">工具:</span>
          <span className="text-white capitalize">{activeTool}</span>
        </div>
        
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">选择:</span>
            <span className="text-white">{selectedIds.length} 个</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">正交:</span>
            <span className={orthoEnabled ? 'text-cyan-400' : 'text-gray-600'}>
              {orthoEnabled ? '开' : '关'}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-gray-500">捕捉:</span>
            <span className={snapEnabled ? 'text-green-400' : 'text-gray-600'}>
              {snapEnabled ? '开' : '关'}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-gray-500">栅格:</span>
            <span className={snapToGrid ? 'text-green-400' : 'text-gray-600'}>
              {snapToGrid ? `${gridSize}` : '关'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-gray-500">坐标:</span>
          <span className="text-white font-mono">
            X: {cursorPosition.x.toFixed(1)} Y: {cursorPosition.y.toFixed(1)} Z: {cursorPosition.z.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}