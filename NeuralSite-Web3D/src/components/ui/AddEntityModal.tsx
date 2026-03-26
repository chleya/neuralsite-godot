import { useState } from 'react';
import { useSceneStore } from '../../core';
import type { ConstructionPhase, AnyNode } from '../../core';
import { StationRangeInput } from './StationInput';

interface AddEntityModalProps {
  onClose: () => void;
}

export function AddEntityModal({ onClose }: AddEntityModalProps) {
  const [entityType, setEntityType] = useState<'road' | 'bridge'>('road');
  const [name, setName] = useState('');
  const [startStation, setStartStation] = useState('K0+000');
  const [endStation, setEndStation] = useState('K0+500');
  const [width, setWidth] = useState(12);
  const [lanes, setLanes] = useState(4);
  const createNode = useSceneStore((s) => s.createNode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parseStationValue = (s: string) => {
      const match = s.match(/K(\d+)\+(\d+)/);
      if (match) return parseInt(match[1]) * 1000 + parseInt(match[2]);
      return 0;
    };

    const baseNode = {
      id: `${entityType}_${Date.now()}`,
      name: name.trim(),
      visible: true,
      phase: 'planning' as ConstructionPhase,
      progress: 0,
      planned_start_date: '2026-01-01',
      planned_end_date: '2026-01-31',
      actual_start_date: null,
      actual_end_date: null,
      planned_duration_days: 30,
      actual_duration_days: 0,
      quality_status: 'pending' as const,
      safety_level: 'low' as const,
    };

    if (entityType === 'road') {
      await createNode({
        ...baseNode,
        type: 'road',
        stationRange: {
          start: { value: parseStationValue(startStation), formatted: startStation },
          end: { value: parseStationValue(endStation), formatted: endStation },
        },
        lanes,
        width,
        elevation: 0,
        elevation_base: 0,
        lateral_offset: 0,
      } as unknown as AnyNode);
    } else {
      await createNode({
        ...baseNode,
        type: 'bridge',
        stationRange: {
          start: { value: parseStationValue(startStation), formatted: startStation },
          end: { value: parseStationValue(endStation), formatted: endStation },
        },
        width,
        spanCount: 2,
        spanLength: 40,
        elevation_base: 0,
        lateral_offset: 0,
        parts: {
          piles: [],
          piers: [],
          beams: [],
          deck: { thickness: 0.5, status: 'pending' },
        },
      } as unknown as AnyNode);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-[480px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">添加实体</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEntityType('road')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                entityType === 'road' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              道路
            </button>
            <button
              type="button"
              onClick={() => setEntityType('bridge')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                entityType === 'bridge' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              桥梁
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={entityType === 'road' ? '如：K1+000 示范段' : '如：K2+000 跨河大桥'}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">桩号范围</label>
            <StationRangeInput
              startValue={startStation}
              endValue={endStation}
              onStartChange={(v) => setStartStation(v)}
              onEndChange={(v) => setEndStation(v)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">宽度 (m)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseFloat(e.target.value) || 12)}
                min={3}
                max={50}
                step={0.5}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            {entityType === 'road' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">车道数</label>
                <input
                  type="number"
                  value={lanes}
                  onChange={(e) => setLanes(parseInt(e.target.value) || 4)}
                  min={1}
                  max={8}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
