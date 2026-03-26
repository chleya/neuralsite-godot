// NumberInput - 精确数值输入框，支持范围验证和单位显示
import { useState, useCallback, useEffect } from 'react';

interface NumberInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number; // 小数位数
  unit?: string; // 单位后缀
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  allowNull?: boolean; // 是否允许空值
}

export function NumberInput({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  precision = 3,
  unit,
  placeholder = "0",
  disabled = false,
  className = "",
  label,
  allowNull = true,
}: NumberInputProps) {
  const [inputValue, setInputValue] = useState<string>(value !== null ? value.toFixed(precision) : "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(value !== null ? value.toFixed(precision) : "");
  }, [value, precision]);

  const validateAndUpdate = useCallback((str: string) => {
    if (str === "" || str === "-") {
      if (allowNull) {
        setInputValue(str);
        setError(null);
        onChange(null);
      } else {
        setError("不能为空");
      }
      return;
    }

    const num = parseFloat(str);
    if (isNaN(num)) {
      setError("请输入有效数字");
      return;
    }

    if (num < min) {
      setError(`最小值为 ${min}`);
      return;
    }

    if (num > max) {
      setError(`最大值为 ${max}`);
      return;
    }

    // 四舍五入到指定精度
    const rounded = Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
    setInputValue(rounded.toFixed(precision));
    setError(null);
    onChange(rounded);
  }, [min, max, precision, allowNull, onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // 允许输入负号和小数点开头
    if (newValue === "-" || newValue === "." || newValue === "-.") {
      setInputValue(newValue);
      setError(null);
      return;
    }
    
    // 只允许数字和一个小数点
    if (/^-?\d*\.?\d*$/.test(newValue)) {
      setInputValue(newValue);
      // 实时预览错误
      const num = parseFloat(newValue);
      if (!isNaN(num) && (num < min || num > max)) {
        setError(`有效范围: ${min} ~ ${max}`);
      } else {
        setError(null);
      }
    }
  }, [min, max]);

  const handleBlur = useCallback(() => {
    validateAndUpdate(inputValue);
  }, [inputValue, validateAndUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateAndUpdate(inputValue);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const current = parseFloat(inputValue) || 0;
      const newVal = Math.min(max, current + step);
      setInputValue(newVal.toFixed(precision));
      onChange(newVal);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const current = parseFloat(inputValue) || 0;
      const newVal = Math.max(min, current - step);
      setInputValue(newVal.toFixed(precision));
      onChange(newVal);
    }
  }, [inputValue, min, max, step, precision, onChange, validateAndUpdate]);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-300">{label}</label>
      )}
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pr-12 bg-gray-700 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            {unit}
          </span>
        )}
      </div>
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
    </div>
  );
}

// IntegerInput - 整数输入
interface IntegerInputProps extends Omit<NumberInputProps, 'precision' | 'step'> {
  step?: number;
}

export function IntegerInput(props: IntegerInputProps) {
  return <NumberInput {...props} precision={0} step={props.step ?? 1} />;
}
