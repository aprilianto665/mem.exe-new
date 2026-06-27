import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import type { InputProps } from '../../types/input.types';

export const Input = ({
  label,
  error,
  className = '',
  variant = 'default',
  type,
  ...props
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const variantStyles = {
    default: `border ${
      error
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-[#7DB8E0] focus:ring-[#7DB8E0]'
    } bg-white`,
    noBorder: 'border-0 bg-[#F8FAFC] focus:ring-0',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          className={`w-full px-4 py-3 rounded-2xl text-base ${
            variant === 'noBorder'
              ? variantStyles.noBorder
              : variantStyles.default
          } ${
            variant === 'default' ? 'focus:outline-none focus:ring-2 focus:ring-opacity-20' : 'focus:outline-none'
          } text-gray-900 placeholder-gray-400 ${
            isPassword ? 'pr-12' : ''
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" strokeWidth={2} />
            ) : (
              <EyeIcon className="w-5 h-5" strokeWidth={2} />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

