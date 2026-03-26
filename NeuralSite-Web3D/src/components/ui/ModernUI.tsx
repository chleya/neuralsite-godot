// ModernPanelStyles - Shared styles for beautiful modal panels
import React from 'react';

// Glass morphism card component
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: string;
}

export function GlassCard({ children, className = '', glow = 'blue' }: GlassCardProps) {
  const glowColors: Record<string, string> = {
    blue: 'shadow-blue-500/20',
    emerald: 'shadow-emerald-500/20',
    amber: 'shadow-amber-500/20',
    rose: 'shadow-rose-500/20',
    purple: 'shadow-purple-500/20',
  };
  
  return (
    <div className={`
      bg-slate-900/80 backdrop-blur-xl
      rounded-2xl
      border border-white/10
      shadow-2xl ${glowColors[glow]}
      ${className}
    `}>
      {children}
    </div>
  );
}

// Gradient button with shimmer effect
interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function GradientButton({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'blue', 
  size = 'md',
  disabled = false,
  className = '' 
}: GradientButtonProps) {
  const gradients: Record<string, string> = {
    blue: 'from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400',
    emerald: 'from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400',
    amber: 'from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400',
    rose: 'from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400',
    purple: 'from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400',
  };
  
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-gradient-to-r ${gradients[variant]}
        text-white font-medium
        rounded-xl
        transition-all duration-200
        hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        shadow-lg
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// Floating action button
interface FABProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'blue' | 'emerald' | 'amber';
  position?: string;
}

export function FAB({ children, onClick, variant = 'blue', position = 'bottom-6 left-6' }: FABProps) {
  const gradients: Record<string, string> = {
    blue: 'from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400',
    emerald: 'from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400',
    amber: 'from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400',
  };
  
  return (
    <button
      onClick={onClick}
      className={`
        fixed ${position}
        bg-gradient-to-r ${gradients[variant]}
        text-white
        px-5 py-3
        rounded-2xl
        shadow-xl
        flex items-center gap-3
        transition-all duration-200
        hover:scale-105 active:scale-95
        animate-pulse-slow
        ring-2 ring-white/20
      `}
    >
      {children}
    </button>
  );
}

// Section header with icon
interface SectionHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
  variant?: 'blue' | 'emerald' | 'amber' | 'rose';
}

export function SectionHeader({ icon, title, subtitle, variant = 'blue' }: SectionHeaderProps) {
  const colors: Record<string, string> = {
    blue: 'from-blue-600 to-blue-500',
    emerald: 'from-emerald-600 to-emerald-500',
    amber: 'from-amber-600 to-amber-500',
    rose: 'from-rose-600 to-rose-500',
  };
  
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className={`
        w-12 h-12 rounded-xl
        bg-gradient-to-br ${colors[variant]}
        flex items-center justify-center
        text-2xl
        shadow-lg
        ring-2 ring-white/20
      `}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

// Form field with floating label effect
interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
}

export function FormField({ label, children, error }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-300 ml-1">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-rose-400 ml-1">{error}</p>
      )}
    </div>
  );
}

// Tab component
interface TabProps {
  tabs: { key: string; label: string; icon: string }[];
  activeTab: string;
  onChange: (key: string) => void;
  variant?: 'blue' | 'emerald';
}

export function Tabs({ tabs, activeTab, onChange, variant = 'blue' }: TabProps) {
  const activeColors: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-400',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-400',
  };
  
  return (
    <div className="flex border-b border-slate-700 gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`
            flex-1 py-3 px-4
            text-sm font-medium
            rounded-t-xl
            transition-all duration-200
            flex items-center justify-center gap-2
            ${activeTab === tab.key
              ? `${activeColors[variant]} border-b-2`
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }
          `}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

// Stat card for dashboard
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
  variant?: 'blue' | 'emerald' | 'amber' | 'rose';
}

export function StatCard({ icon, label, value, trend, variant = 'blue' }: StatCardProps) {
  const colors: Record<string, string> = {
    blue: 'from-blue-600/20 to-blue-500/10 border-blue-500/30',
    emerald: 'from-emerald-600/20 to-emerald-500/10 border-emerald-500/30',
    amber: 'from-amber-600/20 to-amber-500/10 border-amber-500/30',
    rose: 'from-rose-600/20 to-rose-500/10 border-rose-500/30',
  };
  
  return (
    <div className={`
      p-4 rounded-xl
      bg-gradient-to-br ${colors[variant]}
      border
      backdrop-blur-sm
    `}>
      <div className="flex items-start justify-between">
        <div className="text-2xl">{icon}</div>
        {trend && (
          <div className={`text-xs font-medium ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-slate-400">{label}</div>
      </div>
    </div>
  );
}

// Empty state component
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4 opacity-50">{icon}</div>
      <h4 className="text-lg font-medium text-white mb-1">{title}</h4>
      <p className="text-sm text-slate-400 mb-4">{description}</p>
      {action && (
        <GradientButton onClick={action.onClick} variant="blue" size="sm">
          {action.label}
        </GradientButton>
      )}
    </div>
  );
}

// Loading spinner
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes: Record<string, string> = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  return (
    <div className="flex items-center justify-center py-8">
      <div className={`
        ${sizes[size]}
        border-2 border-white/20
        border-t-blue-500
        rounded-full
        animate-spin
      `} />
    </div>
  );
}

// Badge component
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-slate-600/50 text-slate-300',
    success: 'bg-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/20 text-amber-400',
    danger: 'bg-rose-500/20 text-rose-400',
    info: 'bg-blue-500/20 text-blue-400',
  };
  
  return (
    <span className={`
      px-2 py-0.5 rounded-full text-xs font-medium
      ${variants[variant]}
    `}>
      {children}
    </span>
  );
}

// Progress bar with gradient
interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, max = 100, showLabel = false, variant = 'blue', size = 'md' }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colors: Record<string, string> = {
    blue: 'from-blue-500 to-blue-400',
    emerald: 'from-emerald-500 to-emerald-400',
    amber: 'from-amber-500 to-amber-400',
    rose: 'from-rose-500 to-rose-400',
    purple: 'from-purple-500 to-purple-400',
  };
  
  const heights: Record<string, string> = {
    sm: 'h-1.5',
    md: 'h-2.5',
  };
  
  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 ${heights[size]} bg-slate-700 rounded-full overflow-hidden`}>
        <div 
          className={`h-full bg-gradient-to-r ${colors[variant]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-white w-12 text-right">
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  );
}

// Confirmation Dialog
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  confirmLabel = '确认', 
  cancelLabel = '取消',
  variant = 'danger',
  onConfirm, 
  onCancel 
}: ConfirmDialogProps) {
  if (!isOpen) return null;
  
  const variants = {
    danger: 'from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400',
    warning: 'from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400',
    info: 'from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400',
  };
  
  const icons = {
    danger: '⚠️',
    warning: '⚡',
    info: '💡',
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <GlassCard className="w-full max-w-md" glow={variant === 'danger' ? 'rose' : variant === 'warning' ? 'amber' : 'blue'}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
              {icons[variant]}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-slate-300">{message}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700/50 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-white font-medium bg-gradient-to-r ${variants[variant]} shadow-lg transition-all hover:scale-105 active:scale-95`}
          >
            {confirmLabel}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

// Search Input component
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = '搜索...' }: SearchInputProps) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full px-4 py-2.5 pl-10 rounded-xl
          bg-slate-700/50 border border-slate-600
          text-white placeholder-slate-500
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
          transition-all
        "
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        🔍
      </span>
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
        >
          ×
        </button>
      )}
    </div>
  );
}
