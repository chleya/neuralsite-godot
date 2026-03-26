// PropertyPanel - Enhanced data input with real-time preview
import { useState, useCallback, useEffect, useRef } from 'react';
import { useSceneStore } from '../../core/store';
import { useEditorStore } from '../../core/editor-store';
import type { AnyNode, ConstructionPhase, RoadNode, BridgeNode } from '../../core/schema';
import { StationInput, parseStation, formatStation } from './StationInput';
import { NumberInput, IntegerInput } from './NumberInput';

interface SliderWithNumberProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  precision?: number;
}

function SliderWithNumber({ value, onChange, min, max, step = 1, label, unit = '', precision = 0 }: SliderWithNumberProps) {
  const [localValue, setLocalValue] = useState(value.toFixed(precision));
  const [isDragging, setIsDragging] = useState(false);
  
  useEffect(() => {
    if (!isDragging) {
      setLocalValue(value.toFixed(precision));
    }
  }, [value, precision, isDragging]);
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue.toFixed(precision));
    onChange(newValue);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };
  
  const handleInputBlur = () => {
    const num = parseFloat(localValue);
    if (!isNaN(num)) {
      const clamped = Math.max(min, Math.min(max, num));
      onChange(clamped);
      setLocalValue(clamped.toFixed(precision));
    } else {
      setLocalValue(value.toFixed(precision));
    }
  };
  
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <label className="text-sm text-gray-400">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={localValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={() => setIsDragging(true)}
            className="w-16 px-2 py-0.5 bg-gray-700 border border-gray-600 rounded text-white text-sm text-right"
          />
          {unit && <span className="text-xs text-gray-500">{unit}</span>}
        </div>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute inset-x-0 h-1 bg-gray-700 rounded-full">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow border border-gray-400 cursor-pointer hover:bg-gray-100"
            style={{ left: `calc(${percentage}% - 6px)` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

// Main property panel with tabs
interface PropertyPanelProps {
  nodeId: string;
}

export function PropertyPanel({ nodeId }: PropertyPanelProps) {
  const node = useSceneStore((s) => s.nodes[nodeId]);
  const updateNode = useSceneStore((s) => s.updateNode);
  const addNotification = useSceneStore((s) => s.addNotification);
  
  const [activeTab, setActiveTab] = useState<'basic' | 'geometry' | 'schedule' | 'quality'>('basic');
  const [localDraft, setLocalDraft] = useState<Partial<AnyNode>>({});
  const [isDirty, setIsDirty] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    if (node) {
      setLocalDraft({});
      setIsDirty(false);
    }
  }, [nodeId, node]);
  
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, []);
  
  const handleChange = useCallback((path: string, value: unknown) => {
    setLocalDraft(prev => {
      const newDraft = { ...prev };
      (newDraft as Record<string, unknown>)[path] = value;
      return newDraft;
    });
    setIsDirty(true);
    
    // Debounced preview update - only updates local state, NOT API
    // API call happens ONLY on Save button click
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // This only updates local preview, no API call
      // User must click "应用更改" to persist
    }, 300);
  }, [nodeId]);
  
  const handleSave = useCallback(async () => {
    // Clear any pending debounced updates
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    
    if (Object.keys(localDraft).length > 0) {
      const result = await updateNode(nodeId, localDraft);
      if (result.success) {
        setLocalDraft({});
        setIsDirty(false);
      } else {
        // Keep draft and dirty flag on failure so user can retry
        addNotification({
          type: 'error',
          message: `保存失败: ${result.error || '未知错误'} - 您的更改已保留，请重试`,
          duration: 8000,
        });
      }
    }
  }, [nodeId, localDraft, updateNode, addNotification]);
  
  const handleReset = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setLocalDraft({});
    setIsDirty(false);
  }, []);
  
  if (!node) return null;
  
  const getValue = (path: string, defaultValue: unknown): unknown => {
    if (path in localDraft) return localDraft[path as keyof typeof localDraft];
    if (node && path in node) return (node as Record<string, unknown>)[path];
    return defaultValue;
  };
  
  const tabs = [
    { id: 'basic', label: '基本' },
    { id: 'geometry', label: '几何' },
    { id: 'schedule', label: '进度' },
    { id: 'quality', label: '质量' },
  ];
  
  const isRoadOrBridge = 'stationRange' in node;
  
  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 px-3 py-2 text-sm transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'basic' && (
          <>
            {/* Name */}
            <div className="space-y-1">
              <label className="text-sm text-gray-400">名称</label>
              <input
                type="text"
                value={getValue('name', '') as string}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Phase */}
            <div className="space-y-1">
              <label className="text-sm text-gray-400">施工阶段</label>
              <select
                value={getValue('phase', 'planning') as string}
                onChange={(e) => handleChange('phase', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planning">规划</option>
                <option value="clearing">清表</option>
                <option value="earthwork">土方</option>
                <option value="pavement">路面</option>
                <option value="finishing">收尾</option>
                <option value="completed">完成</option>
              </select>
            </div>
            
            {/* Progress with slider */}
            <SliderWithNumber
              label="完成进度"
              value={(getValue('progress', 0) as number) * 100}
              onChange={(v) => handleChange('progress', v / 100)}
              min={0}
              max={100}
              step={1}
              unit="%"
              precision={0}
            />
            
            {/* Visible */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">可见</label>
              <button
                onClick={() => handleChange('visible', !(getValue('visible', true) as boolean))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  getValue('visible', true) ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  getValue('visible', true) ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </>
        )}
        
        {activeTab === 'geometry' && isRoadOrBridge && (
          <>
            {/* Station Range */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">桩号范围</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">起点</label>
                  <StationInput
                    value={(node as RoadNode | BridgeNode).stationRange?.start?.formatted || 'K0+000'}
                    onChange={(formatted) => {
                      const parsed = parseStation(formatted);
                      handleChange('stationRange', {
                        ...(node as RoadNode | BridgeNode).stationRange,
                        start: { value: parsed.value, formatted },
                      });
                    }}
                    disabled={false}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">终点</label>
                  <StationInput
                    value={(node as RoadNode | BridgeNode).stationRange?.end?.formatted || 'K0+500'}
                    onChange={(formatted) => {
                      const parsed = parseStation(formatted);
                      handleChange('stationRange', {
                        ...(node as RoadNode | BridgeNode).stationRange,
                        end: { value: parsed.value, formatted },
                      });
                    }}
                    disabled={false}
                  />
                </div>
              </div>
            </div>
            
            {/* Width */}
            <SliderWithNumber
              label="宽度"
              value={getValue('width', 12) as number}
              onChange={(v) => handleChange('width', v)}
              min={3}
              max={50}
              step={0.5}
              unit="m"
              precision={1}
            />
            
            {/* Elevation */}
            <SliderWithNumber
              label="设计高程"
              value={getValue('elevation_base', 0) as number}
              onChange={(v) => handleChange('elevation_base', v)}
              min={-50}
              max={200}
              step={0.1}
              unit="m"
              precision={2}
            />
            
            {/* Lateral Offset */}
            <SliderWithNumber
              label="横向偏移"
              value={getValue('lateral_offset', 0) as number}
              onChange={(v) => handleChange('lateral_offset', v)}
              min={-20}
              max={20}
              step={0.5}
              unit="m"
              precision={1}
            />
            
            {/* Lanes (road only) */}
            {'lanes' in node && (
              <SliderWithNumber
                label="车道数"
                value={getValue('lanes', 4) as number}
                onChange={(v) => handleChange('lanes', v)}
                min={1}
                max={8}
                step={1}
                precision={0}
              />
            )}
          </>
        )}
        
        {activeTab === 'schedule' && (
          <>
            <div className="text-sm text-gray-400 space-y-3">
              <p className="text-xs text-gray-500">计划日期设置（需后端API支持）</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">计划开始</label>
                  <input
                    type="date"
                    value={(node as any).planned_start_date || ''}
                    onChange={(e) => handleChange('planned_start_date', e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">计划结束</label>
                  <input
                    type="date"
                    value={(node as any).planned_end_date || ''}
                    onChange={(e) => handleChange('planned_end_date', e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">实际开始</label>
                  <input
                    type="date"
                    value={(node as any).actual_start_date || ''}
                    onChange={(e) => handleChange('actual_start_date', e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">实际结束</label>
                  <input
                    type="date"
                    value={(node as any).actual_end_date || ''}
                    onChange={(e) => handleChange('actual_end_date', e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">计划工期</label>
                  <IntegerInput
                    value={(node as any).planned_duration_days || 30}
                    onChange={(v) => v !== null && handleChange('planned_duration_days', v)}
                    min={1}
                    max={1000}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">实际工期</label>
                  <IntegerInput
                    value={(node as any).actual_duration_days || 0}
                    onChange={(v) => v !== null && handleChange('actual_duration_days', v)}
                    min={0}
                    max={1000}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'quality' && (
          <>
            <div className="text-sm text-gray-400 space-y-3">
              <p className="text-xs text-gray-500">质量管理（需后端API支持）</p>
              
              <div>
                <label className="text-xs text-gray-500 mb-1 block">质量状态</label>
                <select
                  value={(node as any).quality_status || 'pending'}
                  onChange={(e) => handleChange('quality_status', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none"
                >
                  <option value="pending">待检验</option>
                  <option value="inspecting">检验中</option>
                  <option value="qualified">合格</option>
                  <option value="unqualified">不合格</option>
                  <option value="accepted">已验收</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-gray-500 mb-1 block">验收日期</label>
                <input
                  type="date"
                  value={(node as any).acceptance_date || ''}
                  onChange={(e) => handleChange('acceptance_date', e.target.value)}
                  className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-500 mb-1 block">验收人</label>
                <input
                  type="text"
                  value={(node as any).acceptance_by || ''}
                  onChange={(e) => handleChange('acceptance_by', e.target.value)}
                  placeholder="输入验收人姓名"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-500 mb-1 block">质量证书编号</label>
                <input
                  type="text"
                  value={(node as any).quality_cert_no || ''}
                  onChange={(e) => handleChange('quality_cert_no', e.target.value)}
                  placeholder="证书编号"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-500 mb-1 block">安全风险等级</label>
                <select
                  value={(node as any).safety_level || 'low'}
                  onChange={(e) => handleChange('safety_level', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none"
                >
                  <option value="low">低风险</option>
                  <option value="medium">中风险</option>
                  <option value="high">高风险</option>
                  <option value="critical">极高风险</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Footer with save/reset */}
      {isDirty && (
        <div className="flex gap-2 p-3 border-t border-gray-700 bg-gray-800">
          <button
            onClick={handleReset}
            className="flex-1 px-3 py-1.5 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
          >
            重置
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 transition-colors"
          >
            应用更改
          </button>
        </div>
      )}
    </div>
  );
}