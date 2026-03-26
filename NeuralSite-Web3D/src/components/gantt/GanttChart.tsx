// GanttChart - 4D construction timeline visualization
import { useState, useCallback, useMemo, useRef } from 'react';
import { useSceneStore } from '../../core/store';
import type { AnyNode, ConstructionPhase } from '../../core/schema';

// Extended node type with 4D properties (using type assertion)
type ExtendedNode = AnyNode & {
  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  planned_duration_days?: number;
  actual_duration_days?: number;
  quality_status?: string;
  safety_level?: string;
};

interface GanttBarProps {
  node: ExtendedNode;
  dayWidth: number;
  totalDays: number;
  startDay: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

function daysSince2026(dateStr: string): number {
  const date = new Date(dateStr);
  const start = new Date(2026, 0, 1);
  return Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function GanttBar({ node, dayWidth, totalDays, startDay, isSelected, onSelect }: GanttBarProps) {
  const barWidth = totalDays * dayWidth;
  
  const phaseColors: Record<string, string> = {
    planning: '#4A90D9',
    clearing: '#FFB84D',
    earthwork: '#996633',
    pavement: '#666666',
    finishing: '#66CC66',
    completed: '#333333',
  };
  
  const plannedStart = node.planned_start_date ? daysSince2026(node.planned_start_date) : startDay;
  const plannedEnd = node.planned_end_date ? daysSince2026(node.planned_end_date) : startDay + 30;
  const plannedWidth = Math.max((plannedEnd - plannedStart) * dayWidth, 20);
  
  const actualStart = node.actual_start_date ? daysSince2026(node.actual_start_date) : plannedStart;
  const actualProgress = node.progress ?? 0;
  const actualWidth = actualProgress * plannedWidth;
  
  const isOverdue = node.planned_end_date && actualProgress < 1 && 
    new Date(node.planned_end_date) < new Date();
  
  return (
    <div 
      className={`relative h-[28px] bg-gray-700/50 rounded cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:bg-gray-600/50'
      }`}
      style={{ width: barWidth }}
      onClick={onSelect}
    >
      {/* Planned bar */}
      <div 
        className="absolute top-1 h-[10px] rounded-sm opacity-40"
        style={{ 
          left: plannedStart * dayWidth, 
          width: plannedWidth,
          backgroundColor: phaseColors[node.phase] || '#888',
        }}
      />
      
      {/* Actual bar */}
      <div 
        className="absolute top-1 h-[10px] rounded-sm"
        style={{ 
          left: actualStart * dayWidth, 
          width: actualWidth,
          backgroundColor: isOverdue ? '#FF4444' : (phaseColors[node.phase] || '#888'),
        }}
      />
      
      {/* Progress percentage */}
      <div className="absolute top-[12px] left-2 text-xs text-gray-400">
        {(node.progress * 100).toFixed(0)}%
      </div>
      
      {/* Name label */}
      <div 
        className="absolute top-[12px] text-xs text-white truncate"
        style={{ left: 50 }}
      >
        {node.name}
      </div>
    </div>
  );
}

function formatDateFromDays(days: number): string {
  const date = new Date(2026, 0, 1 + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Main GanttChart component
export function GanttChart() {
  const nodes = useSceneStore((s) => s.nodes);
  const rootNodeIds = useSceneStore((s) => s.rootNodeIds);
  const currentDay = useSceneStore((s) => s.currentDay);
  const setCurrentDay = useSceneStore((s) => s.setCurrentDay);
  const totalDays = useSceneStore((s) => s.totalDays);
  const selection = useSceneStore((s) => s.selection);
  const setSelection = useSceneStore((s) => s.setSelection);
  
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'quarter'>('month');
  const [scrollX, setScrollX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const dayWidth = viewMode === 'month' ? 8 : viewMode === 'week' ? 20 : 4;
  
  const entityNodes = useMemo(() => {
    return rootNodeIds.map(id => nodes[id]).filter(Boolean) as ExtendedNode[];
  }, [nodes, rootNodeIds]);
  
  const timeHeaders = useMemo(() => {
    const headers: { label: string; days: number }[] = [];
    const step = viewMode === 'month' ? 30 : viewMode === 'week' ? 7 : 90;
    
    for (let day = 0; day < totalDays; day += step) {
      const date = new Date(2026, 0, 1 + day);
      headers.push({
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        days: day,
      });
    }
    return headers;
  }, [totalDays, viewMode]);
  
  const dayMarkers = useMemo(() => {
    const markers: number[] = [];
    const step = viewMode === 'month' ? 10 : viewMode === 'week' ? 1 : 30;
    for (let day = 0; day < totalDays; day += step) {
      markers.push(day);
    }
    return markers;
  }, [totalDays, viewMode]);
  
  const handleBarClick = useCallback((nodeId: string, node: ExtendedNode) => {
    setSelection({ nodeId, nodeType: node.type, position: null });
  }, [setSelection]);
  
  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollX;
    const day = Math.floor(x / dayWidth);
    setCurrentDay(Math.max(0, Math.min(day, totalDays)));
  }, [scrollX, dayWidth, totalDays, setCurrentDay]);
  
  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-medium">4D 施工进度</h3>
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            {(['month', 'week', 'quarter'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  viewMode === mode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {mode === 'month' ? '月' : mode === 'week' ? '周' : '季度'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>第 {currentDay} 天</span>
          <span>{formatDateFromDays(currentDay)}</span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-700 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 bg-blue-500/40 rounded" />
          <span className="text-gray-400">计划</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 bg-blue-500 rounded" />
          <span className="text-gray-400">实际</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 bg-red-500 rounded" />
          <span className="text-gray-400">延期</span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <div className="w-px h-4 bg-gray-600" />
          <span className="text-gray-500">竖线 = 当前日期</span>
        </div>
      </div>
      
      {/* Chart area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Entity names column */}
        <div className="w-48 flex-shrink-0 border-r border-gray-700 overflow-y-auto">
          <div className="h-8 border-b border-gray-700 bg-gray-800" />
          {entityNodes.map((node) => (
            <div 
              key={node.id}
              className={`h-[32px] flex items-center px-3 border-b border-gray-700/50 cursor-pointer transition-colors ${
                selection.nodeId === node.id ? 'bg-blue-900/30' : 'hover:bg-gray-800'
              }`}
              onClick={() => handleBarClick(node.id, node)}
            >
              <span className="text-sm text-gray-300 truncate">{node.name}</span>
            </div>
          ))}
        </div>
        
        {/* Timeline area */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-x-auto overflow-y-auto"
          onScroll={(e) => setScrollX(e.currentTarget.scrollLeft)}
        >
          <div style={{ width: totalDays * dayWidth, minHeight: '100%' }}>
            {/* Time header */}
            <div className="h-8 border-b border-gray-700 bg-gray-800/50 sticky top-0 z-10">
              <div className="flex">
                {timeHeaders.map((header, i) => (
                  <div 
                    key={i}
                    className="text-xs text-gray-400 px-2 py-1 border-l border-gray-700/50"
                    style={{ width: (viewMode === 'month' ? 30 : viewMode === 'week' ? 7 : 90) * dayWidth }}
                  >
                    {header.label}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Day markers */}
            <div className="h-4 border-b border-gray-700/50 relative">
              {dayMarkers.map((day) => (
                <div 
                  key={day}
                  className="absolute top-0 bottom-0 w-px bg-gray-700/30"
                  style={{ left: day * dayWidth }}
                />
              ))}
            </div>
            
            {/* Current day indicator */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-20 pointer-events-none"
              style={{ left: currentDay * dayWidth }}
            />
            
            {/* Gantt bars */}
            <div className="relative" onClick={handleTimelineClick}>
              {entityNodes.map((node) => (
                <div 
                  key={node.id}
                  className="h-[32px] border-b border-gray-700/50 relative"
                >
                  <GanttBar
                    node={node}
                    dayWidth={dayWidth}
                    totalDays={totalDays}
                    startDay={0}
                    isSelected={selection.nodeId === node.id}
                    onSelect={() => handleBarClick(node.id, node)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact Gantt for sidebar
export function CompactGantt() {
  const nodes = useSceneStore((s) => s.nodes);
  const rootNodeIds = useSceneStore((s) => s.rootNodeIds);
  const currentDay = useSceneStore((s) => s.currentDay);
  const totalDays = useSceneStore((s) => s.totalDays);
  
  const entityNodes = useMemo(() => {
    return rootNodeIds.map(id => nodes[id]).filter(Boolean) as ExtendedNode[];
  }, [nodes, rootNodeIds]);
  
  const barWidth = 200;
  
  const phaseColors: Record<string, string> = {
    planning: '#4A90D9',
    clearing: '#FFB84D',
    earthwork: '#996633',
    pavement: '#666666',
    finishing: '#66CC66',
    completed: '#333333',
  };
  
  return (
    <div className="p-3 border-t border-gray-700">
      <h4 className="text-gray-400 text-xs mb-2 uppercase tracking-wide">进度概览</h4>
      <div className="space-y-2">
        {entityNodes.slice(0, 5).map((node) => {
          const plannedStart = node.planned_start_date ? daysSince2026(node.planned_start_date) : 0;
          const plannedDuration = node.planned_duration_days || 30;
          const progress = node.progress || 0;
          
          return (
            <div key={node.id} className="flex items-center gap-2">
              <div className="w-16 text-xs text-gray-400 truncate">
                {node.name.split(' ')[0]}
              </div>
              <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden relative">
                <div 
                  className="h-full opacity-40"
                  style={{ 
                    width: `${(plannedDuration / totalDays) * 100}%`,
                    marginLeft: `${(plannedStart / totalDays) * 100}%`,
                    backgroundColor: phaseColors[node.phase],
                  }}
                />
                <div 
                  className="h-full absolute top-0"
                  style={{ 
                    width: `${progress * (plannedDuration / totalDays) * 100}%`,
                    marginLeft: `${(plannedStart / totalDays) * 100}%`,
                    backgroundColor: phaseColors[node.phase],
                  }}
                />
              </div>
              <div className="w-8 text-xs text-gray-500 text-right">
                {(progress * 100).toFixed(0)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}