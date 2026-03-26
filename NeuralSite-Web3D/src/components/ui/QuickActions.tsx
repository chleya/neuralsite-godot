// QuickActions - Modern progress update and issue registration
import { useState } from 'react';
import { useSceneStore } from '../../core/store';
import { apiService } from '../../core/api';

interface QuickProgressProps {
  entityId: string;
  entityName: string;
  currentProgress: number;
  onClose: () => void;
}

export function QuickProgressInput({ entityId, entityName, currentProgress, onClose }: QuickProgressProps) {
  const [progress, setProgress] = useState(Math.round(currentProgress * 100));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateNode = useSceneStore((s) => s.updateNode);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await updateNode(entityId, { progress: progress / 100 } as any);
    setIsSubmitting(false);
    if (result.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-[420px] overflow-hidden animate-scaleIn border border-slate-700/50">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              📊
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">更新进度</h2>
              <p className="text-blue-100/70 text-sm">{entityName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">×</button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm">当前进度</span>
              <span className="text-2xl font-bold text-white">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-600 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, #475569 ${progress}%, #475569 100%)`
              }}
            />
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors font-medium"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50"
            >
              {isSubmitting ? '保存中...' : '保存进度'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface IssueRegistrationProps {
  entityId: string;
  entityName: string;
  issueType: 'quality' | 'safety';
  onClose: () => void;
}

export function IssueRegistration({ entityId, entityName, issueType, onClose }: IssueRegistrationProps) {
  const [recordDate, setRecordDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('minor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addNotification = useSceneStore((s) => s.addNotification);

  const handleSubmit = async () => {
    if (!description.trim()) {
      addNotification({ type: 'warning', message: '请填写问题描述', duration: 3000 });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (issueType === 'quality') {
        await apiService.createQualityRecord({
          entity_id: entityId,
          record_date: recordDate,
          inspection_type: '日常检查',
          issue_found: description,
          issue_severity: severity,
        });
        addNotification({ type: 'success', message: '质量问题已登记', duration: 3000 });
      } else {
        await apiService.createSafetyRecord({
          entity_id: entityId,
          record_date: recordDate,
          inspection_type: '安全检查',
          hazard_description: description,
          risk_level: severity,
        });
        addNotification({ type: 'success', message: '安全问题已登记', duration: 3000 });
      }
      onClose();
    } catch (e) {
      console.error('Failed to submit:', e);
      addNotification({ type: 'error', message: '提交失败，请重试', duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const severityConfig = {
    minor: { label: '轻微', color: 'bg-amber-500', icon: '⚠️' },
    major: { label: '严重', color: 'bg-orange-500', icon: '🔴' },
    critical: { label: '危急', color: 'bg-rose-500', icon: '☠️' },
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-[480px] overflow-hidden animate-scaleIn border border-slate-700/50">
        <div className={`px-6 py-4 flex items-center justify-between ${
          issueType === 'quality' ? 'bg-gradient-to-r from-amber-600 to-amber-500' : 'bg-gradient-to-r from-rose-600 to-rose-500'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              {issueType === 'quality' ? '🔍' : '⚠️'}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                登记{issueType === 'quality' ? '质量' : '安全'}问题
              </h2>
              <p className="text-white/70 text-sm">{entityName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">×</button>
        </div>
        
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm text-slate-400 mb-2">发现日期</label>
            <input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              {issueType === 'quality' ? '问题描述' : '隐患描述'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="请详细描述发现的问题或隐患..."
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-3">
              {issueType === 'quality' ? '严重程度' : '风险等级'}
            </label>
            <div className="flex gap-3">
              {(['minor', 'major', 'critical'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setSeverity(level)}
                  className={`flex-1 py-3 rounded-xl transition-all font-medium ${
                    severity === level
                      ? `${severityConfig[level].color} text-white shadow-lg`
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div className="text-xl mb-1">{severityConfig[level].icon}</div>
                  <div className="text-sm">{severityConfig[level].label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors font-medium"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !description.trim()}
              className={`flex-1 py-3 text-white rounded-xl font-medium transition-all shadow-lg disabled:opacity-50 ${
                issueType === 'quality' 
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400' 
                  : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400'
              }`}
            >
              {isSubmitting ? '提交中...' : '提交问题'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
