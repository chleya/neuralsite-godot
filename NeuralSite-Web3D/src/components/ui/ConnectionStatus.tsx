import { useSceneStore } from '../../core';

export function ConnectionStatus({ connected, loading }: { connected: boolean; loading: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400' : connected ? 'bg-green-400' : 'bg-gray-500'}`} />
      <span className="text-gray-400 text-xs">
        {loading ? '连接中...' : connected ? '已连接后端' : '离线模式'}
      </span>
    </div>
  );
}
