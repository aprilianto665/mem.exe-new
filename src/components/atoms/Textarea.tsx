import type { TextareaProps } from '../../types/textarea.types';

export const Textarea = ({
  label,
  error,
  className = '',
  variant = 'default',
  rows = 3,
  ...props
}: TextareaProps) => {
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
      <textarea
        rows={rows}
        className={`w-full px-4 py-3 rounded-2xl text-base resize-none ${
          variant === 'noBorder'
            ? variantStyles.noBorder
            : variantStyles.default
        } ${
          variant === 'default' ? 'focus:outline-none focus:ring-2 focus:ring-opacity-20' : 'focus:outline-none'
        } text-gray-900 placeholder-gray-400 ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

