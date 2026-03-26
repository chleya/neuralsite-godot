// CreatePanel - Beautiful entity creation panel with modern UI
import { useState, useCallback, useEffect } from 'react';
import { useSceneStore } from '../../core/store';
import { useEditorStore } from '../../core/editor-store';
import { StationInput, parseStation, formatStation } from './StationInput';
import { NumberInput } from './NumberInput';
import type { AnyNode } from '../../core/schema';
import { GlassCard, SectionHeader, FormField, Tabs, ProgressBar, GradientButton } from './ModernUI';

type EntityType = 'road' | 'bridge' | 'fence' | 'sign';

const ENTITY_TYPES: { key: EntityType; label: string; icon: string; color: string }[] = [
  { key: 'road', label: '道路', icon: '🛤️', color: 'blue' },
  { key: 'bridge', label: '桥梁', icon: '🌉', color: 'amber' },
  { key: 'fence', label: '围挡', icon: '🚧', color: 'emerald' },
  { key: 'sign', label: '标识', icon: '🚸', color: 'purple' },
];

const PHASES = [
  { value: 'planning', label: '规划', color: 'bg-blue-500' },
  { value: 'clearing', label: '清表', color: 'bg-orange-500' },
  { value: 'earthwork', label: '土方', color: 'bg-amber-700' },
  { value: 'pavement', label: '路面', color: 'bg-gray-500' },
  { value: 'finishing', label: '收尾', color: 'bg-lime-500' },
  { value: 'completed', label: '完成', color: 'bg-slate-600' },
];

export function CreatePanel() {
  const createNode = useSceneStore((s) => s.createNode);
  const setPreviewEntity = useSceneStore((s) => s.setPreviewEntity);
  const setTool = useEditorStore((s) => s.setTool);
  const setStatusMessage = useEditorStore((s) => s.setStatusMessage);
  
  const [isOpen, setIsOpen] = useState(false);
  const [entityType, setEntityType] = useState<EntityType>('road');
  const [name, setName] = useState('');
  const [startStation, setStartStation] = useState('K0+000');
  const [endStation, setEndStation] = useState('K0+500');
  const [width, setWidth] = useState(12);
  const [lanes, setLanes] = useState(4);
  const [lateralOffset, setLateralOffset] = useState(0);
  const [elevation, setElevation] = useState(0);
  const [phase, setPhase] = useState('planning');
  const [progress, setProgress] = useState(0);
  const [isPreview, setIsPreview] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey) {
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setPreviewEntity(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setPreviewEntity]);

  useEffect(() => {
    if (!isPreview) return;
    
    const start = parseStation(startStation);
    const end = parseStation(endStation);
    
    if (!start.valid || !end.valid) {
      setPreviewEntity(null);
      return;
    }
    
    const nodeId = `preview_${Date.now()}`;
    const previewNode: AnyNode = {
      id: nodeId,
      type: entityType,
      name: name.trim() || `${startStation} to ${endStation}`,
      visible: true,
      stationRange: {
        start: { value: start.value, formatted: formatStation(start.value) },
        end: { value: end.value, formatted: formatStation(end.value) },
      },
      width,
      lanes,
      lateral_offset: lateralOffset,
      elevation,
      elevation_base: elevation,
      phase: phase as any,
      progress,
      ...(entityType === 'bridge' ? {
        spanCount: 2,
        spanLength: 40,
        parts: { piles: [], piers: [], beams: [], deck: { thickness: 0.5, status: 'pending' as const } }
      } : {}),
      ...(entityType === 'fence' || entityType === 'sign' ? {
        startPosition: { x: 0, y: 0, z: 0 },
        endPosition: { x: 0, y: 0, z: 0 },
        height: 1.5,
      } : {}),
    } as any;
    
    setPreviewEntity(previewNode);
  }, [isPreview, entityType, name, startStation, endStation, width, lanes, lateralOffset, elevation, phase, progress, setPreviewEntity]);

  useEffect(() => {
    if (!isOpen) {
      setPreviewEntity(null);
      setIsPreview(false);
    }
  }, [isOpen, setPreviewEntity]);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    
    const start = parseStation(startStation);
    const end = parseStation(endStation);
    
    if (!start.valid) {
      newErrors.startStation = '无效的起点桩号';
    }
    if (!end.valid) {
      newErrors.endStation = '无效的终点桩号';
    }
    if (start.valid && end.valid && start.value >= end.value) {
      newErrors.endStation = '终点桩号必须大于起点';
    }
    
    if (!name.trim()) {
      newErrors.name = '请输入实体名称';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [startStation, endStation, name]);

  const handleCreate = useCallback(async () => {
    if (!validate()) return;
    setIsCreating(true);

    const start = parseStation(startStation);
    const end = parseStation(endStation);
    
    const nodeId = `${entityType}_${Date.now()}`;
    
    const nodeData: AnyNode = {
      id: nodeId,
      type: entityType,
      name: name.trim() || `${startStation} to ${endStation}`,
      visible: true,
      stationRange: {
        start: { value: start.value, formatted: formatStation(start.value) },
        end: { value: end.value, formatted: formatStation(end.value) },
      },
      width,
      lanes,
      lateral_offset: lateralOffset,
      elevation,
      elevation_base: elevation,
      phase: phase as any,
      progress,
      ...(entityType === 'bridge' ? {
        spanCount: 2,
        spanLength: 40,
        parts: { piles: [], piers: [], beams: [], deck: { thickness: 0.5, status: 'pending' } }
      } : {}),
      ...(entityType === 'fence' || entityType === 'sign' ? {
        startPosition: { x: 0, y: 0, z: 0 },
        endPosition: { x: 0, y: 0, z: 0 },
        height: 1.5,
      } : {}),
    } as any;

    const result = await createNode(nodeData);
    setIsCreating(false);
    
    if (result.success) {
      setStatusMessage(`已创建 ${entityType}: ${nodeData.name}`);
      setIsOpen(false);
      resetForm();
      setTool('select');
    } else {
      setErrors({ general: result.error || '创建失败' });
    }
  }, [validate, createNode, entityType, name, startStation, endStation, width, lanes, lateralOffset, elevation, phase, progress, setStatusMessage, setTool]);

  const resetForm = () => {
    setName('');
    setStartStation('K0+000');
    setEndStation('K0+500');
    setWidth(12);
    setLanes(4);
    setLateralOffset(0);
    setElevation(0);
    setPhase('planning');
    setProgress(0);
    setErrors({});
  };

  const calculateLength = useCallback(() => {
    const start = parseStation(startStation);
    const end = parseStation(endStation);
    if (start.valid && end.valid) {
      return ((end.value - start.value) / 1000).toFixed(3);
    }
    return null;
  }, [startStation, endStation]);

  const length = calculateLength();
  const currentType = ENTITY_TYPES.find(t => t.key === entityType)!;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="
          fixed bottom-6 left-6 z-40
          bg-gradient-to-r from-blue-600 to-blue-500
          hover:from-blue-500 hover:to-blue-400
          text-white px-6 py-4 rounded-2xl
          shadow-2xl shadow-blue-500/30
          flex items-center gap-3
          transition-all duration-200
          hover:scale-105 active:scale-95
          ring-2 ring-white/20
          group
        "
      >
        <span className="text-2xl group-hover:scale-110 transition-transform">➕</span>
        <div className="text-left">
          <div className="font-semibold">新建实体</div>
          <div className="text-xs text-blue-200 flex items-center gap-2">
            <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">C</kbd>
            <span>快捷键</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" glow={currentType.color}>
        {/* Header */}
        <div className={`
          px-6 py-5 flex items-center justify-between
          bg-gradient-to-r ${currentType.color === 'blue' ? 'from-blue-600/90 to-blue-500/80' : 
            currentType.color === 'amber' ? 'from-amber-600/90 to-amber-500/80' :
            currentType.color === 'emerald' ? 'from-emerald-600/90 to-emerald-500/80' :
            'from-purple-600/90 to-purple-500/80'}
        `}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl shadow-lg">
              {currentType.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">新建工程实体</h2>
              <p className="text-sm text-white/70">创建道路、桥梁等工程构件</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white text-xl transition-all"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Entity Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-3">实体类型</label>
            <div className="grid grid-cols-4 gap-3">
              {ENTITY_TYPES.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setEntityType(type.key)}
                  className={`
                    p-4 rounded-xl text-center transition-all duration-200
                    ${entityType === type.key
                      ? `bg-gradient-to-br ${type.color === 'blue' ? 'from-blue-600 to-blue-500' : 
                        type.color === 'amber' ? 'from-amber-600 to-amber-500' :
                        type.color === 'emerald' ? 'from-emerald-600 to-emerald-500' :
                        'from-purple-600 to-purple-500'} 
                        text-white shadow-lg scale-105 ring-2 ring-white/30`
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:scale-102'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-xs font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <FormField label="实体名称" error={errors.name}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`例如: ${startStation}段`}
              className={`
                w-full px-4 py-3 rounded-xl
                bg-slate-700/50 border
                text-white placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                transition-all
                ${errors.name ? 'border-rose-500' : 'border-slate-600'}
              `}
            />
          </FormField>

          {/* Station Range */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="起点桩号" error={errors.startStation}>
              <StationInput value={startStation} onChange={(v) => setStartStation(v)} />
            </FormField>
            <FormField label="终点桩号" error={errors.endStation}>
              <StationInput value={endStation} onChange={(v) => setEndStation(v)} />
            </FormField>
          </div>

          {/* Length Display */}
          {length && (
            <div className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-xl px-5 py-3 flex items-center justify-between">
              <span className="text-slate-400">计算长度</span>
              <span className="text-xl font-bold text-white">{length} <span className="text-sm font-normal text-slate-400">米</span></span>
            </div>
          )}

          {/* Geometry Parameters */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-400">几何参数</label>
            <div className="grid grid-cols-3 gap-4">
              <NumberInput label="宽度 (m)" value={width} onChange={(v) => setWidth(v ?? 12)} min={3} max={50} step={0.5} />
              {entityType === 'road' && (
                <NumberInput label="车道数" value={lanes} onChange={(v) => setLanes(v ?? 4)} min={1} max={8} step={1} />
              )}
              <NumberInput label="横向偏移 (m)" value={lateralOffset} onChange={(v) => setLateralOffset(v ?? 0)} min={-20} max={20} step={0.5} />
            </div>
            {entityType !== 'fence' && entityType !== 'sign' && (
              <NumberInput label="设计高程 (m)" value={elevation} onChange={(v) => setElevation(v ?? 0)} min={0} max={500} step={0.1} />
            )}
          </div>

          {/* Phase & Progress */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-3">施工阶段</label>
              <div className="flex flex-wrap gap-2">
                {PHASES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPhase(p.value)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${phase === p.value 
                        ? `${p.color} text-white shadow-lg` 
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600'}
                    `}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-400">完成进度</label>
                <span className="text-sm font-bold text-white">{Math.round(progress * 100)}%</span>
              </div>
              <ProgressBar value={progress * 100} variant={phase === 'completed' ? 'emerald' : 'blue'} />
              <input
                type="range"
                value={progress * 100}
                onChange={(e) => setProgress(parseInt(e.target.value) / 100)}
                min={0}
                max={100}
                className="w-full mt-2 accent-blue-500"
              />
            </div>
          </div>

          {/* Preview Toggle */}
          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 cursor-pointer hover:bg-slate-700/50 transition-colors">
            <input
              type="checkbox"
              checked={isPreview}
              onChange={(e) => setIsPreview(e.target.checked)}
              className="w-5 h-5 rounded accent-blue-500"
            />
            <span className="text-slate-300">在 3D 场景中实时预览</span>
          </label>

          {errors.general && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 text-sm">
              {errors.general}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700/50 flex justify-between items-center">
          <button
            onClick={resetForm}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            重置表单
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            >
              取消
            </button>
            <GradientButton onClick={handleCreate} variant={currentType.color as any} disabled={isCreating}>
              {isCreating ? '创建中...' : '创建实体'}
            </GradientButton>
            <button
              onClick={async () => {
                if (!validate() || isCreating) return;
                setIsCreating(true);
                const start = parseStation(startStation);
                const end = parseStation(endStation);
                const nodeId = `${entityType}_${Date.now()}`;
                const nodeData: AnyNode = {
                  id: nodeId,
                  type: entityType,
                  name: name.trim() || `${startStation} to ${endStation}`,
                  visible: true,
                  stationRange: {
                    start: { value: start.value, formatted: formatStation(start.value) },
                    end: { value: end.value, formatted: formatStation(end.value) },
                  },
                  width,
                  lanes,
                  lateral_offset: lateralOffset,
                  elevation,
                  elevation_base: elevation,
                  phase: phase as any,
                  progress,
                } as any;
                await createNode(nodeData);
                setStatusMessage(`已创建 ${entityType}: ${nodeData.name}`);
                resetForm();
                setStartStation(formatStation(end.value + 500));
                setEndStation(formatStation(end.value + 1000));
                setIsCreating(false);
              }}
              disabled={isCreating}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? '创建中...' : '创建并继续'}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
