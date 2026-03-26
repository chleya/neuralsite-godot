import { ConnectionStatus } from './ConnectionStatus';

interface AppHeaderProps {
  apiConnected: boolean;
  isLoading: boolean;
  viewMode: string;
  setViewMode: (mode: '3d' | 'gantt' | 'quantity' | 'dashboard') => void;
  onLoadDemo: () => void;
  onLoadAPI: () => void;
}

export function AppHeader({
  apiConnected,
  isLoading,
  viewMode,
  setViewMode,
  onLoadDemo,
  onLoadAPI,
}: AppHeaderProps) {
  return (
    <header className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
            N
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">NeuralSite</h1>
            <p className="text-xs text-slate-400">工程施工管理平台</p>
          </div>
        </div>
        
        <ConnectionStatus connected={apiConnected} loading={isLoading} />
        
        {/* View mode tabs */}
        <div className="flex gap-1 ml-4 bg-slate-700/50 rounded-xl p-1">
          {[
            { key: 'dashboard', label: '概览', icon: '📊' },
            { key: '3d', label: '3D视图', icon: '🎮' },
            { key: 'gantt', label: '甘特图', icon: '📅' },
            { key: 'quantity', label: '工程量', icon: '🧱' },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setViewMode(key as '3d' | 'gantt' | 'quantity' | 'dashboard')}
              className={`px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-2 ${
                viewMode === key 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-600/50'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-slate-500 text-xs flex gap-3">
          <span><kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-slate-400">0-3</kbd> 切换视图</span>
          <span><kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-slate-400">Space</kbd> 播放</span>
          <span><kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-slate-400">C</kbd> 创建</span>
        </div>
        <button
          onClick={onLoadDemo}
          className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
        >
          演示数据
        </button>
        <button
          onClick={onLoadAPI}
          disabled={isLoading}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 transition-colors disabled:opacity-50"
        >
          {isLoading ? '加载中...' : '加载API'}
        </button>
      </div>
    </header>
  );
}
