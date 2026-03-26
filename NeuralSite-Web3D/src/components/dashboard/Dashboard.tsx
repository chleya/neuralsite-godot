// Dashboard - Modern Project Overview with Statistics
import { useState, useEffect } from 'react';
import { apiService } from '../../core/api';

interface DashboardProps {
  onOpenResource?: (tab: 'personnel' | 'equipment' | 'materials' | 'funds') => void;
  onOpenCreate?: () => void;
  onOpenImport?: () => void;
  onOpenProgress?: () => void;
  onOpenReport?: () => void;
}

interface DashboardData {
  project_count: number;
  section_count: number;
  entity_by_type: Array<{ entity_type: string; count: number; avg_progress: number }>;
  overall_progress: number;
  quantity_completion: number;
  open_quality_issues: number;
  open_safety_issues: number;
}

interface Project {
  id: string;
  code: string;
  name: string;
  construction_unit: string;
  supervision_unit: string;
  planned_start_date: string;
  planned_end_date: string;
  total_budget: number;
  status: string;
}

const ENTITY_ICONS: Record<string, string> = {
  road: '🛤️',
  bridge: '🌉',
  culvert: '🔲',
  fence: '🚧',
  sign: '🚸',
};

const PHASE_COLORS: Record<string, string> = {
  planning: '#60a5fa',
  clearing: '#fbbf24',
  earthwork: '#a78bfa',
  pavement: '#34d399',
  finishing: '#f472b6',
  completed: '#6b7280',
};

export function Dashboard({ onOpenResource, onOpenCreate, onOpenImport, onOpenProgress, onOpenReport }: DashboardProps = {}) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiService.getDashboardSummary().catch(err => {
        console.error('Dashboard API error:', err);
        setError('无法加载数据');
        return null;
      }),
      apiService.getProjects().catch(err => {
        console.error('Projects API error:', err);
        return [];
      }),
    ]).then(([dashData, projData]) => {
      if (dashData) setDashboard(dashData);
      setProjects(projData || []);
    }).finally(() => setIsLoading(false));
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000000) return (amount / 100000000).toFixed(2) + ' 亿';
    if (amount >= 10000) return (amount / 10000).toFixed(0) + ' 万';
    return amount?.toFixed(0) || '0';
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !dashboard) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error || '无法加载仪表盘数据'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  const project = projects[0];

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">项目概览</h1>
        <p className="text-slate-400">实时监控工程项目进度和质量</p>
      </div>

      {/* Project Info Card */}
      {project && (
        <div className="card-gradient rounded-2xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">{project.name}</h2>
                  <span className={`badge ${project.status === 'in_progress' ? 'badge-green' : 'badge-gray'}`}>
                    {project.status === 'in_progress' ? '进行中' : project.status}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">项目编号: {project.code}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard label="建设单位" value={project.construction_unit || '-'} />
              <InfoCard label="监理单位" value={project.supervision_unit || '-'} />
              <InfoCard 
                label="计划工期" 
                value={`${project.planned_start_date?.slice(0,10) || '-'} 至 ${project.planned_end_date?.slice(0,10) || '-'}`} 
              />
              <InfoCard label="总投资" value={formatCurrency(project.total_budget) + ' 元'} />
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          label="项目总数"
          value={dashboard?.project_count ?? 0}
          suffix="个"
          icon="📁"
          color="blue"
          gradient="from-blue-500/20 to-blue-600/10"
        />
        <StatsCard
          label="分段数量"
          value={dashboard?.section_count ?? 0}
          suffix="个"
          icon="📍"
          color="emerald"
          gradient="from-emerald-500/20 to-emerald-600/10"
        />
        <StatsCard
          label="整体进度"
          value={dashboard?.overall_progress ?? 0}
          suffix="%"
          icon="📈"
          color="cyan"
          gradient="from-cyan-500/20 to-cyan-600/10"
          isPercent
        />
        <StatsCard
          label="工程量完成"
          value={dashboard?.quantity_completion ?? 0}
          suffix="%"
          icon="🧱"
          color="amber"
          gradient="from-amber-500/20 to-amber-600/10"
          isPercent
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Entity Stats */}
        <div className="lg:col-span-2 card-gradient rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📊</span> 实体统计
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {dashboard?.entity_by_type?.map((item) => (
              <EntityStatCard
                key={item.entity_type}
                type={item.entity_type}
                count={item.count}
                progress={item.avg_progress}
              />
            ))}
          </div>
        </div>

        {/* Issues Overview */}
        <div className="space-y-4">
          <div className={`card-gradient rounded-2xl p-6 ${(dashboard?.open_quality_issues ?? 0) > 0 ? 'border-rose-500/50' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">质量问题</h3>
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-xl">
                🔍
              </div>
            </div>
            <div className="text-center py-4">
              <div className={`text-5xl font-bold mb-2 ${(dashboard?.open_quality_issues ?? 0) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {dashboard?.open_quality_issues ?? 0}
              </div>
              <div className="text-slate-400">待处理问题</div>
            </div>
            <button 
              className="w-full btn btn-secondary text-sm"
              onClick={() => {
                if (onOpenResource) {
                  onOpenResource('materials');
                } else {
                  // TODO: Filter to show quality issues view
                  alert('质量问题列表功能开发中');
                }
              }}
            >
              查看全部
            </button>
          </div>

          <div className={`card-gradient rounded-2xl p-6 ${(dashboard?.open_safety_issues ?? 0) > 0 ? 'border-amber-500/50' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">安全问题</h3>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl">
                ⚠️
              </div>
            </div>
            <div className="text-center py-4">
              <div className={`text-5xl font-bold mb-2 ${(dashboard?.open_safety_issues ?? 0) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {dashboard?.open_safety_issues ?? 0}
              </div>
              <div className="text-slate-400">待处理问题</div>
            </div>
            <button 
              className="w-full btn btn-secondary text-sm"
              onClick={() => {
                if (onOpenResource) {
                  onOpenResource('equipment');
                } else {
                  // TODO: Filter to show safety issues view
                  alert('安全问题列表功能开发中');
                }
              }}
            >
              查看全部
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-gradient rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>⚡</span> 快捷操作
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction icon="➕" label="新建实体" color="blue" onClick={() => {
            onOpenCreate?.();
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }));
          }} />
          <QuickAction icon="📥" label="批量导入" color="emerald" onClick={() => {
            onOpenImport?.();
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'i', altKey: true }));
          }} />
          <QuickAction icon="📊" label="填写进度" color="amber" onClick={() => {
            onOpenProgress?.();
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', shiftKey: true }));
          }} />
          <QuickAction icon="📋" label="提交报告" color="purple" onClick={() => {
            onOpenReport?.();
          }} />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4">
      <div className="text-slate-400 text-xs mb-1">{label}</div>
      <div className="text-white font-medium text-sm truncate">{value}</div>
    </div>
  );
}

function StatsCard({ label, value, suffix, icon, color, gradient, isPercent }: {
  label: string;
  value: number;
  suffix: string;
  icon: string;
  color: string;
  gradient: string;
  isPercent?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    cyan: 'text-cyan-400',
    amber: 'text-amber-400',
  };

  return (
    <div className={`stats-card stats-card-${color} rounded-2xl p-5 relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-3xl font-bold ${colorClasses[color]}`}>
          {isPercent ? value.toFixed(1) : value}
          <span className="text-lg text-slate-400 ml-1">{suffix}</span>
        </span>
      </div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  );
}

function EntityStatCard({ type, count, progress }: { type: string; count: number; progress: number }) {
  const icons: Record<string, string> = {
    road: '🛤️',
    bridge: '🌉',
    culvert: '🔲',
    fence: '🚧',
    sign: '🚸',
  };

  const names: Record<string, string> = {
    road: '道路',
    bridge: '桥梁',
    culvert: '涵洞',
    fence: '围挡',
    sign: '标识',
  };

  const progressPercent = progress * 100;
  const progressColor = progressPercent >= 80 ? 'bg-emerald-500' :
                        progressPercent >= 50 ? 'bg-blue-500' :
                        progressPercent >= 25 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800/70 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl">{icons[type] || '📦'}</span>
        <span className="text-2xl font-bold text-white">{count}</span>
      </div>
      <div className="text-slate-400 text-sm mb-2">{names[type] || type}</div>
      <div className="progress-bar">
        <div 
          className={`progress-bar-fill ${progressColor}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="text-xs text-slate-500 mt-1 text-right">{progressPercent.toFixed(0)}%</div>
    </div>
  );
}

function QuickAction({ icon, label, color, onClick }: { icon: string; label: string; color: string; onClick?: () => void }) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/10 hover:from-blue-500/30 hover:to-blue-600/20 border-blue-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/10 hover:from-emerald-500/30 hover:to-emerald-600/20 border-emerald-500/30',
    amber: 'from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 border-amber-500/30',
    purple: 'from-purple-500/20 to-purple-600/10 hover:from-purple-500/30 hover:to-purple-600/20 border-purple-500/30',
  };

  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} border transition-all hover:scale-105 active:scale-95`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-white text-sm font-medium">{label}</div>
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-32 bg-slate-800 rounded" />
        <div className="h-40 bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
