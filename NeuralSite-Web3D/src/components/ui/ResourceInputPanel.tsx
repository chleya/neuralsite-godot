// ResourceInputPanel - Modern resource management panel
import { useState, useEffect, useMemo } from 'react';
import { apiService } from '../../core/api';
import { useSceneStore } from '../../core/store';
import { GlassCard, FormField, Tabs, GradientButton, Badge, ProgressBar, EmptyState, LoadingSpinner, ConfirmDialog, SearchInput } from './ModernUI';

type ResourceTab = 'personnel' | 'equipment' | 'materials' | 'funds';

const TABS: { key: ResourceTab; label: string; icon: string }[] = [
  { key: 'personnel', label: '人员', icon: '👷' },
  { key: 'equipment', label: '设备', icon: '🚜' },
  { key: 'materials', label: '材料', icon: '🧱' },
  { key: 'funds', label: '资金', icon: '💰' },
];

const WORK_TYPES = ['钢筋工', '模板工', '混凝土工', '电工', '焊工', '司机', '普通工', '测量工'];
const EQUIPMENT_TYPES = ['挖掘机', '推土机', '压路机', '起重机', '混凝土搅拌车', '运输车', '摊铺机', '平地机'];
const MATERIAL_TYPES = ['水泥', '钢筋', '砂石', '沥青', '混凝土', '模板', '土工布', '碎石'];
const FUND_CATEGORIES = ['人工费', '材料费', '机械费', '管理费', '其他'];

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  active: 'success',
  approved: 'success',
  pending: 'warning',
  inactive: 'info',
};

export function ResourceInputPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ResourceTab>('personnel');
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const addNotification = useSceneStore((s) => s.addNotification);
  const selection = useSceneStore((s) => s.selection);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.toLowerCase() === 'r' && e.shiftKey) {
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadRecords();
    }
  }, [isOpen, activeTab]);

  // Filter records by search query
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase();
    return records.filter((r: any) => {
      if (activeTab === 'personnel') return r.name?.toLowerCase().includes(q) || r.work_type?.toLowerCase().includes(q);
      if (activeTab === 'equipment') return r.equipment_type?.toLowerCase().includes(q);
      if (activeTab === 'materials') return r.material_type?.toLowerCase().includes(q);
      if (activeTab === 'funds') return r.budget_category?.toLowerCase().includes(q);
      return true;
    });
  }, [records, searchQuery, activeTab]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const entityId = selection.nodeId || undefined;
      let data: unknown[] = [];
      switch (activeTab) {
        case 'personnel':
          data = await apiService.getPersonnel(entityId);
          break;
        case 'equipment':
          data = await apiService.getEquipment(entityId);
          break;
        case 'materials':
          data = await apiService.getMaterials(entityId);
          break;
        case 'funds':
          data = await apiService.getFunds(entityId);
          break;
      }
      setRecords(data as Record<string, unknown>[]);
      setLoadError(null);
    } catch (e) {
      console.error('Failed to load records:', e);
      setLoadError('加载失败，请重试');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      switch (activeTab) {
        case 'personnel':
          await apiService.deletePersonnel(id);
          break;
        case 'equipment':
          await apiService.deleteEquipment(id);
          break;
        case 'materials':
          await apiService.deleteMaterial(id);
          break;
        case 'funds':
          await apiService.deleteFund(id);
          break;
      }
      addNotification({ type: 'success', message: '删除成功', duration: 3000 });
      loadRecords();
    } catch (e) {
      addNotification({ type: 'error', message: '删除失败', duration: 3000 });
    }
    setDeleteConfirm(null);
  };

  const confirmDelete = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="
          fixed bottom-6 left-48 z-40
          bg-gradient-to-r from-emerald-600 to-emerald-500
          hover:from-emerald-500 hover:to-emerald-400
          text-white px-6 py-4 rounded-2xl
          shadow-2xl shadow-emerald-500/30
          flex items-center gap-3
          transition-all duration-200
          hover:scale-105 active:scale-95
          ring-2 ring-white/20
          group
        "
      >
        <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
        <div className="text-left">
          <div className="font-semibold">资源管理</div>
          <div className="text-xs text-emerald-200 flex items-center gap-2">
            <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">Shift+R</kbd>
            <span>快捷键</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col" glow="emerald">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600/90 to-emerald-500/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl shadow-lg">
                📊
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">资源投入管理</h2>
                <p className="text-sm text-emerald-200">
                  {selection.nodeId ? `当前实体: ${selection.nodeId}` : '管理项目人员、设备、材料、资金'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white text-xl transition-all"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs tabs={TABS} activeTab={activeTab} onChange={(k) => setActiveTab(k as ResourceTab)} variant="emerald" />

        {/* Search */}
        <div className="px-6 py-3 border-b border-slate-700/50">
          <SearchInput 
            value={searchQuery} 
            onChange={setSearchQuery}
            placeholder={`搜索${TABS.find(t => t.key === activeTab)?.label}...`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <LoadingSpinner />
          ) : filteredRecords.length === 0 ? (
            <EmptyState
              icon={TABS.find(t => t.key === activeTab)?.icon || '📋'}
              title="暂无记录"
              description={`点击下方按钮添加${TABS.find(t => t.key === activeTab)?.label}记录`}
              action={{ label: '添加记录', onClick: () => setShowForm(true) }}
            />
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record: any, idx: number) => (
                <div 
                  key={record.id || idx}
                  className="p-4 rounded-xl bg-slate-700/50 border border-slate-600/30 hover:bg-slate-700/70 hover:border-slate-500/50 transition-all"
                >
                  {activeTab === 'personnel' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">
                          👷
                        </div>
                        <div>
                          <div className="font-semibold text-white">{record.name}</div>
                          <div className="text-sm text-slate-400">
                            {record.work_type} · {record.team || '未分配班组'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={STATUS_COLORS[record.status] || 'info'}>
                          {record.status === 'active' ? '在岗' : record.status}
                        </Badge>
                        <button
                          onClick={() => confirmDelete(record.id, record.name || '此记录')}
                          className="text-slate-400 hover:text-rose-400 text-sm transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'equipment' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl">
                          🚜
                        </div>
                        <div>
                          <div className="font-semibold text-white">{record.equipment_type}</div>
                          <div className="text-sm text-slate-400">
                            使用时长: {record.usage_hours}h
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={STATUS_COLORS[record.status] || 'info'}>
                          {record.status}
                        </Badge>
                        <button
                          onClick={() => confirmDelete(record.id, record.name || '此记录')}
                          className="text-slate-400 hover:text-rose-400 text-sm transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'materials' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl">
                          🧱
                        </div>
                        <div>
                          <div className="font-semibold text-white">{record.material_type}</div>
                          <div className="text-sm text-slate-400">
                            数量: {record.quantity} {record.unit}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => confirmDelete(record.id, record.name || '此记录')}
                        className="text-slate-400 hover:text-rose-400 text-sm transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  )}
                  
                  {activeTab === 'funds' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl">
                          💰
                        </div>
                        <div>
                          <div className="font-semibold text-white">{record.budget_category}</div>
                          <div className="text-sm text-slate-400">
                            ¥{record.amount?.toLocaleString()} · 已用 ¥{record.used_amount?.toLocaleString()}
                          </div>
                          <ProgressBar 
                            value={(record.used_amount / record.amount) * 100} 
                            variant="purple" 
                            size="sm" 
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={STATUS_COLORS[record.status] || 'info'}>
                          {record.status === 'approved' ? '已审批' : record.status === 'pending' ? '审批中' : record.status}
                        </Badge>
                        <button
                          onClick={() => confirmDelete(record.id, record.name || '此记录')}
                          className="text-slate-400 hover:text-rose-400 text-sm transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700/50 flex justify-between items-center">
          <div className="text-sm text-slate-400">
            共 {filteredRecords.length} 条记录{searchQuery && ` (${records.length} 全量)`}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            >
              关闭
            </button>
            <GradientButton onClick={() => setShowForm(true)} variant="emerald">
              + 添加记录
            </GradientButton>
          </div>
        </div>

        {/* Add Form Modal */}
        {showForm && (
          <ResourceForm
            entityId={selection.nodeId || ''}
            type={activeTab}
            onSuccess={() => {
              setShowForm(false);
              loadRecords();
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm !== null}
          title="确认删除"
          message={`确定要删除 "${deleteConfirm?.name}" 吗？此操作不可撤销。`}
          confirmLabel="删除"
          cancelLabel="取消"
          variant="danger"
          onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      </GlassCard>
    </div>
  );
}

// Resource Form Component
interface ResourceFormProps {
  entityId: string;
  type: ResourceTab;
  onSuccess: () => void;
  onCancel: () => void;
}

function ResourceForm({ entityId, type, onSuccess, onCancel }: ResourceFormProps) {
  const addNotification = useSceneStore((s) => s.addNotification);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string | number>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityId) {
      addNotification({ type: 'warning', message: '请先选择实体', duration: 3000 });
      return;
    }

    setSubmitting(true);
    try {
      switch (type) {
        case 'personnel':
          await apiService.createPersonnel({
            entity_id: entityId,
            name: formData.name as string,
            work_type: formData.work_type as string || '普通工',
            team: formData.team as string || '',
            qualification: formData.qualification as string || '',
          });
          addNotification({ type: 'success', message: '人员添加成功', duration: 3000 });
          break;
        case 'equipment':
          await apiService.createEquipment({
            entity_id: entityId,
            equipment_type: formData.equipment_type as string || '其他',
            usage_hours: Number(formData.usage_hours) || 0,
          });
          addNotification({ type: 'success', message: '设备添加成功', duration: 3000 });
          break;
        case 'materials':
          await apiService.createMaterial({
            entity_id: entityId,
            material_type: formData.material_type as string || '其他',
            quantity: Number(formData.quantity) || 0,
            unit: formData.unit as string || '批',
          });
          addNotification({ type: 'success', message: '材料添加成功', duration: 3000 });
          break;
        case 'funds':
          await apiService.createFund({
            entity_id: entityId,
            budget_category: formData.budget_category as string || '其他',
            amount: Number(formData.amount) || 0,
            used_amount: Number(formData.used_amount) || 0,
          });
          addNotification({ type: 'success', message: '资金记录添加成功', duration: 3000 });
          break;
      }
      onSuccess();
    } catch (e) {
      console.error('Failed to create:', e);
      addNotification({ type: 'error', message: '添加失败', duration: 3000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <GlassCard className="w-full max-w-md" glow="emerald">
        <div className="p-6 border-b border-slate-700/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-3">
            <span className="text-2xl">{TABS.find(t => t.key === type)?.icon}</span>
            添加{TABS.find(t => t.key === type)?.label}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {type === 'personnel' && (
            <>
              <FormField label="姓名 *">
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="输入人员姓名"
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                />
              </FormField>
              <FormField label="工种">
                <select
                  value={formData.work_type || ''}
                  onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                >
                  <option value="">选择工种</option>
                  {WORK_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </FormField>
              <FormField label="班组">
                <input
                  type="text"
                  value={formData.team || ''}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                  placeholder="输入班组名称"
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                />
              </FormField>
            </>
          )}

          {type === 'equipment' && (
            <>
              <FormField label="设备类型">
                <select
                  value={formData.equipment_type || ''}
                  onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                >
                  <option value="">选择设备</option>
                  {EQUIPMENT_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </FormField>
              <FormField label="使用时长 (小时)">
                <input
                  type="number"
                  value={formData.usage_hours || ''}
                  onChange={(e) => setFormData({ ...formData, usage_hours: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                />
              </FormField>
            </>
          )}

          {type === 'materials' && (
            <>
              <FormField label="材料类型">
                <select
                  value={formData.material_type || ''}
                  onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                >
                  <option value="">选择材料</option>
                  {MATERIAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="数量">
                  <input
                    type="number"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                  />
                </FormField>
                <FormField label="单位">
                  <select
                    value={formData.unit || ''}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                  >
                    <option value="">单位</option>
                    <option value="吨">吨</option>
                    <option value="方">方</option>
                    <option value="米">米</option>
                    <option value="块">块</option>
                    <option value="卷">卷</option>
                    <option value="批">批</option>
                  </select>
                </FormField>
              </div>
            </>
          )}

          {type === 'funds' && (
            <>
              <FormField label="预算类别">
                <select
                  value={formData.budget_category || ''}
                  onChange={(e) => setFormData({ ...formData, budget_category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                >
                  <option value="">选择类别</option>
                  {FUND_CATEGORIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </FormField>
              <FormField label="预算金额 (¥)">
                <input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                />
              </FormField>
              <FormField label="已用金额 (¥)">
                <input
                  type="number"
                  value={formData.used_amount || ''}
                  onChange={(e) => setFormData({ ...formData, used_amount: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                />
              </FormField>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            >
              取消
            </button>
            <GradientButton type="submit" disabled={submitting} variant="emerald">
              {submitting ? '提交中...' : '确认添加'}
            </GradientButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

export default ResourceInputPanel;
