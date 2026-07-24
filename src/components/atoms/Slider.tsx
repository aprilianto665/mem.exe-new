import type { InputHTMLAttributes } from 'react';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  label?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  warningColor?: string;
}

export const Slider = ({
  label,
  min,
  max,
  step,
  value,
  onChange,
  formatValue = (val) => `${val}`,
  className = '',
  warningColor,
  ...props
}: SliderProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const sliderColor = warningColor || '#7DB8E0';
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {label}
          </label>
          <span className={`text-lg font-bold ${warningColor ? 'text-[#F6657E]' : 'text-gray-900'}`}>
            {formatValue(value)}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className={`custom-slider w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${warningColor ? 'slider-warning' : ''}`}
        style={{
          background: `linear-gradient(to right, ${sliderColor} 0%, ${sliderColor} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
        }}
        {...props}
      />
    </div>
  );
};
