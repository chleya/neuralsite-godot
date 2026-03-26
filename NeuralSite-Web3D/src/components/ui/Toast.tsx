// Toast - Modern notification system with stacking and deduplication
import { useEffect, useState, useRef } from 'react';
import { useSceneStore } from '../../core/store';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

const ICONS: Record<string, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const COLORS: Record<string, { bg: string; border: string; icon: string }> = {
  success: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', icon: 'text-emerald-400' },
  error: { bg: 'bg-rose-500/20', border: 'border-rose-500/50', icon: 'text-rose-400' },
  warning: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', icon: 'text-amber-400' },
  info: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', icon: 'text-blue-400' },
};

const MAX_TOASTS = 5;
const DEDUP_WINDOW_MS = 2000;

// Default durations by type (ms)
const DEFAULT_DURATIONS: Record<string, number> = {
  success: 3000,
  error: 8000,
  warning: 5000,
  info: 4000,
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notifications = useSceneStore((s) => s.notifications);
  const lastMessageRef = useRef<{ message: string; time: number } | null>(null);
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[notifications.length - 1];
      
      // Deduplicate: skip if same message within window
      const now = Date.now();
      if (
        lastMessageRef.current &&
        lastMessageRef.current.message === latest.message &&
        now - lastMessageRef.current.time < DEDUP_WINDOW_MS
      ) {
        return;
      }
      lastMessageRef.current = { message: latest.message, time: now };
      
      const toast: Toast = {
        id: latest.id,
        type: latest.type,
        message: latest.message,
        duration: latest.duration,
      };
      
      setToasts(prev => {
        // Limit max toasts
        const updated = [...prev, toast];
        if (updated.length > MAX_TOASTS) {
          return updated.slice(-MAX_TOASTS);
        }
        return updated;
      });
      
      // Auto-remove after duration - track timeout for cleanup
      const timeout = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== latest.id));
        timeoutsRef.current.delete(timeout);
      }, latest.duration || DEFAULT_DURATIONS[latest.type] || 3000);
      timeoutsRef.current.add(timeout);
    }
    
    // Cleanup: clear all timeouts on unmount
    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current.clear();
    };
  }, [notifications]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-h-[80vh] overflow-hidden">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const colors = COLORS[toast.type];
  
  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  return (
    <div 
      className={`${colors.bg} backdrop-blur-sm ${colors.border} border rounded-xl px-4 py-3 shadow-xl flex items-center gap-3 min-w-[280px] max-w-[400px] animate-slideUp`}
    >
      <div className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center ${colors.icon} text-base`}>
        {ICONS[toast.type]}
      </div>
      <div className="flex-1 text-white text-sm break-words">{toast.message}</div>
      <button 
        onClick={onClose}
        className="text-slate-400 hover:text-white transition-colors shrink-0"
      >
        ×
      </button>
    </div>
  );
}
