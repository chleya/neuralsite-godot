import { useState, useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '../../core/editor-store';

interface CommandHistoryItem {
  command: string;
  timestamp: number;
}

const COMMANDS: Record<string, { label: string; shortcut?: string; description: string }> = {
  'road': { label: '道路', shortcut: 'K', description: '绘制道路' },
  'bridge': { label: '桥梁', shortcut: 'B', description: '绘制桥梁' },
  'move': { label: '移动', shortcut: 'M', description: '移动选中实体' },
  'copy': { label: '复制', shortcut: 'Ctrl+C', description: '复制选中实体' },
  'delete': { label: '删除', shortcut: 'Del', description: '删除选中实体' },
  'undo': { label: '撤销', shortcut: 'Ctrl+Z', description: '撤销操作' },
  'redo': { label: '重做', shortcut: 'Ctrl+Y', description: '重做操作' },
  'select': { label: '选择', shortcut: 'V', description: '选择工具' },
  'ortho': { label: '正交', shortcut: 'F8', description: '正交模式' },
  'snap': { label: '捕捉', shortcut: 'F3', description: '对象捕捉' },
  'pan': { label: '平移', shortcut: 'P', description: '平移视图' },
  'zoom': { label: '缩放', shortcut: 'Z', description: '缩放视图' },
  'grid': { label: '栅格', shortcut: 'G', description: '显示/隐藏栅格' },
};

export function CommandLine() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const setTool = useEditorStore((s) => s.setTool);
  const setStatusMessage = useEditorStore((s) => s.setStatusMessage);
  const toggleOrtho = useEditorStore((s) => s.toggleOrtho);
  const toggleSnap = useEditorStore((s) => s.toggleSnap);

  const executeCommand = useCallback((cmd: string) => {
    const command = cmd.toLowerCase().trim();
    
    if (COMMANDS[command]) {
      setStatusMessage(`执行: ${COMMANDS[command].label}`);
      
      switch (command) {
        case 'road':
          setTool('road');
          break;
        case 'bridge':
          setTool('bridge');
          break;
        case 'move':
        case 'copy':
        case 'delete':
        case 'select':
          setTool(command);
          break;
        case 'ortho':
          toggleOrtho();
          break;
        case 'snap':
          toggleSnap();
          break;
        default:
          break;
      }
      
      setHistory(prev => [{ command: cmd, timestamp: Date.now() }, ...prev].slice(0, 50));
    } else {
      setStatusMessage(`未知命令: ${command}`);
    }
    
    setInput('');
    setShowSuggestions(false);
    setHistoryIndex(-1);
  }, [setTool, setStatusMessage, toggleOrtho, toggleSnap]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (input.trim()) {
        executeCommand(input);
      }
    } else if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      setInput(suggestions[0]);
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setInput('');
      inputRef.current?.blur();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]?.command || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]?.command || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'F3') {
      e.preventDefault();
      toggleSnap();
      setStatusMessage('对象捕捉: ' + (useEditorStore.getState().snapEnabled ? '开' : '关'));
    } else if (e.key === 'F8') {
      e.preventDefault();
      toggleOrtho();
      setStatusMessage('正交模式: ' + (useEditorStore.getState().orthoEnabled ? '开' : '关'));
    }
  };

  useEffect(() => {
    if (input.length > 0) {
      const matches = Object.keys(COMMANDS).filter(cmd =>
        cmd.startsWith(input.toLowerCase())
      );
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0 && input.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input]);

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    };
    
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  return (
    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-50 w-[480px]">
      <div className="bg-gray-900/95 backdrop-blur border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
        {/* Command Input */}
        <div className="flex items-center px-3 py-2 border-b border-gray-700">
          <span className="text-gray-400 text-sm mr-2">{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(input.length > 0 && suggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="输入命令或按 / 聚焦..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
            autoComplete="off"
            spellCheck={false}
          />
          <div className="flex gap-1 ml-2">
            <kbd className="px-1.5 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">/</kbd>
            <kbd className="px-1.5 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">F3</kbd>
            <kbd className="px-1.5 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">F8</kbd>
          </div>
        </div>
        
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="border-t border-gray-700 bg-gray-800/95 max-h-48 overflow-y-auto">
            {suggestions.map((cmd) => (
              <div
                key={cmd}
                className="px-3 py-2 flex items-center justify-between hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  setInput(cmd);
                  executeCommand(cmd);
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 text-sm font-mono">{cmd}</span>
                  <span className="text-gray-400 text-sm">{COMMANDS[cmd]?.label}</span>
                </div>
                {COMMANDS[cmd]?.shortcut && (
                  <kbd className="px-1.5 py-0.5 bg-gray-900 text-gray-400 text-xs rounded">
                    {COMMANDS[cmd].shortcut}
                  </kbd>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Command Reference */}
        <div className="px-3 py-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          {Object.entries(COMMANDS).slice(0, 8).map(([cmd, info]) => (
            <span key={cmd} className="flex items-center gap-1">
              <span className="text-cyan-400/70">{cmd}</span>
              {info.shortcut && <span className="text-gray-600">({info.shortcut})</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
