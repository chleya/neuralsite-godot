// StationInput - 桩号输入框，支持表达式解析
// 表达式示例: "K1+500", "K1+500 + 200", "K2+000 - 100"
import { useState, useCallback } from 'react';

const STATION_PATTERN = /^K(\d+)\+(\d{3})(?:\.(\d{1,3}))?$/;

interface ParseResult {
  valid: boolean;
  km: number;
  m: number;
  value: number;
  raw: string;
  error?: string;
}

export function parseStation(input: string): ParseResult {
  const trimmed = input.trim().toUpperCase();
  
  const basicMatch = STATION_PATTERN.exec(trimmed);
  if (basicMatch) {
    const km = parseInt(basicMatch[1], 10);
    const m = parseInt(basicMatch[2], 10);
    const mmStr = basicMatch[3];
    const mm = mmStr ? parseInt(mmStr.padEnd(3, '0'), 10) : 0;
    return {
      valid: true,
      km,
      m,
      value: km * 1000 + m + mm / 1000,
      raw: trimmed,
    };
  }
  
  const exprMatch = trimmed.match(/^K(\d+)\+(\d{3})(?:\.(\d{1,3}))?\s*([+\-])\s*(\d+)$/);
  if (exprMatch) {
    const km = parseInt(exprMatch[1], 10);
    const m = parseInt(exprMatch[2], 10);
    const mmStr = exprMatch[3];
    const mm = mmStr ? parseInt(mmStr.padEnd(3, '0'), 10) : 0;
    const operator = exprMatch[4];
    const delta = parseInt(exprMatch[5], 10);
    
    let totalM = km * 1000 + m + mm / 1000;
    if (operator === '+') {
      totalM += delta;
    } else {
      totalM -= delta;
    }
    
    if (totalM < 0) {
      return { valid: false, km: 0, m: 0, value: 0, raw: trimmed, error: '桩号不能为负' };
    }
    
    const newKm = Math.floor(totalM / 1000);
    const newM = totalM % 1000;
    
    return {
      valid: true,
      km: newKm,
      m: newM,
      value: totalM,
      raw: trimmed,
    };
  }
  
  return { valid: false, km: 0, m: 0, value: 0, raw: trimmed, error: '格式错误，请使用 Kxxx+xxx 或 Kxxx+xxx.x 格式' };
}

export function formatStation(value: number): string {
  const km = Math.floor(value / 1000);
  const remainder = value % 1000;
  const m = Math.floor(remainder);
  const mm = Math.round((remainder - m) * 1000);
  if (mm > 0) {
    return `K${km}+${m.toString().padStart(3, '0')}.${mm.toString()}`;
  }
  return `K${km}+${m.toString().padStart(3, '0')}`;
}

interface StationInputProps {
  value: string;
  onChange: (value: string, parsedValue: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export function StationInput({
  value,
  onChange,
  placeholder = "K0+000",
  disabled = false,
  className = "",
  label,
}: StationInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const result = parseStation(newValue);
    if (!result.valid && newValue.length > 0) {
      setError(result.error || '无效的桩号格式');
      setPreview(null);
    } else if (result.valid && newValue !== value) {
      if (newValue !== result.raw && (newValue.includes('+') || newValue.includes('-'))) {
        setPreview(`= ${formatStation(result.value)}`);
      } else {
        setPreview(null);
      }
      setError(null);
    } else {
      setPreview(null);
      setError(null);
    }
  }, [value]);

  const handleBlur = useCallback(() => {
    const result = parseStation(inputValue);
    if (result.valid) {
      const formatted = formatStation(result.value);
      setInputValue(formatted);
      setPreview(null);
      setError(null);
      if (formatted !== value) {
        onChange(formatted, result.value);
      }
    } else if (inputValue.length > 0) {
      setError(result.error || '无效的桩号');
    }
  }, [inputValue, value, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  }, [handleBlur]);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-300">{label}</label>
      )}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        {preview && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {preview}
          </span>
        )}
      </div>
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
      <span className="text-xs text-gray-500">
        格式: Kxxx+xxx, Kxxx+xxx.x, 或 Kxxx+xxx ± n (如 K1+500.5 + 200)
      </span>
    </div>
  );
}

// StationRangeInput - 桩号范围输入
interface StationRangeInputProps {
  startValue: string;
  endValue: string;
  onStartChange: (value: string, parsedValue: number) => void;
  onEndChange: (value: string, parsedValue: number) => void;
  disabled?: boolean;
  className?: string;
}

export function StationRangeInput({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  disabled = false,
  className = "",
}: StationRangeInputProps) {
  const [startError, setStartError] = useState<string | null>(null);
  const [endError, setEndError] = useState<string | null>(null);
  const [lengthError, setLengthError] = useState<string | null>(null);

  const validateRange = useCallback(() => {
    const start = parseStation(startValue);
    const end = parseStation(endValue);
    
    if (start.valid && end.valid && start.value >= end.value) {
      setLengthError('起点必须小于终点');
    } else {
      setLengthError(null);
    }
  }, [startValue, endValue]);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <StationInput
            value={startValue}
            onChange={(v) => { setStartError(null); onStartChange(v, parseStation(v).value); validateRange(); }}
            placeholder="K0+000"
            disabled={disabled}
            label="起点桩号"
          />
        </div>
        <span className="text-gray-500 mt-6">→</span>
        <div className="flex-1">
          <StationInput
            value={endValue}
            onChange={(v) => { setEndError(null); onEndChange(v, parseStation(v).value); validateRange(); }}
            placeholder="K0+000"
            disabled={disabled}
            label="终点桩号"
          />
        </div>
      </div>
      {(startError || endError || lengthError) && (
        <div className="text-xs text-red-400 space-y-1">
          {startError && <div>{startError}</div>}
          {endError && <div>{endError}</div>}
          {lengthError && <div>{lengthError}</div>}
        </div>
      )}
    </div>
  );
}
