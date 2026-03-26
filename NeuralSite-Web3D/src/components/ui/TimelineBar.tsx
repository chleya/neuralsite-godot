import { useSceneStore } from '../../core';

export function TimelineBar() {
  const currentDay = useSceneStore((s) => s.currentDay);
  const totalDays = useSceneStore((s) => s.totalDays);
  const isPlaying = useSceneStore((s) => s.isPlaying);
  const play = useSceneStore((s) => s.play);
  const pause = useSceneStore((s) => s.pause);
  const setTimeScale = useSceneStore((s) => s.setTimeScale);
  const timeScale = useSceneStore((s) => s.timeScale);
  const setCurrentDay = useSceneStore((s) => s.setCurrentDay);

  const progress = (currentDay / totalDays) * 100;
  const currentDate = new Date(2026, 0, 1 + currentDay);

  return (
    <div className="bg-gray-800 border-t border-gray-700 px-4 py-3">
      <div className="flex items-center gap-6">
        <button
          onClick={() => { if (isPlaying) { pause(); } else { play(); } }}
          className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        
        <div className="text-white font-medium w-32">
          第 {currentDay} 天
        </div>
        <div className="text-gray-400 text-sm w-32">
          {currentDate.toLocaleDateString('zh-CN')}
        </div>
        
        <div className="flex-1">
          <div 
            className="h-2 bg-gray-700 rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const day = Math.floor((x / rect.width) * totalDays);
              setCurrentDay(Math.max(0, Math.min(day, totalDays)));
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Day 0</span>
            <span>Day {totalDays}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">速度</span>
          <select
            value={timeScale}
            onChange={(e) => setTimeScale(parseFloat(e.target.value))}
            className="bg-gray-700 text-white text-sm rounded px-2 py-1"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
            <option value={10}>10x</option>
          </select>
        </div>
      </div>
    </div>
  );
}
