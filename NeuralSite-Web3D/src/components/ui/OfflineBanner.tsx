// OfflineBanner - Shows when API is disconnected
import { useEffect, useState } from 'react';
import { useSceneStore } from '../../core';

export function OfflineBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const apiConnected = useSceneStore((s) => s.apiConnected);
  const checkApiConnection = useSceneStore((s) => s.checkApiConnection);

  useEffect(() => {
    // Check connection on mount
    checkApiConnection();
    
    // Periodically check connection
    const interval = setInterval(() => {
      checkApiConnection();
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [checkApiConnection]);

  useEffect(() => {
    setShowBanner(!apiConnected);
  }, [apiConnected]);

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-600/90 backdrop-blur-sm text-white py-2 px-4 z-[200] flex items-center justify-center gap-4 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-xl">⚠️</span>
        <span className="font-medium">无法连接到后端服务器</span>
        <span className="text-amber-200 text-sm">(数据将仅保存在本地，刷新页面可能丢失)</span>
      </div>
      <button
        onClick={() => checkApiConnection()}
        className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
      >
        重试连接
      </button>
    </div>
  );
}
