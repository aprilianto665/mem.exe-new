import { useId } from 'react';
import type { RadioProps } from '../../types/radio.types';

export const Radio = ({
  label,
  description,
  className = '',
  id,
  variant = 'default',
  ...props
}: RadioProps) => {
  const generatedId = useId();
  const radioId = id || generatedId;

  if (variant === 'card') {
    return (
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={radioId}
          className="flex-1 text-base font-medium text-gray-900 cursor-pointer"
        >
          {label}
        </label>
        <input
          type="radio"
          id={radioId}
          className={`w-5 h-5 border-2 cursor-pointer appearance-none rounded-full bg-white ${
            props.checked ? 'border-[#7DB8E0]' : 'border-gray-300'
          } ${className}`}
          style={{
            ...(props.checked && {
              backgroundImage: 'radial-gradient(circle, white 6px, #7DB8E0 6px, #7DB8E0 100%)',
            }),
          }}
          {...props}
        />
        {description && (
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <input
        type="radio"
        id={radioId}
        className={`mt-1 w-5 h-5 border-2 focus:ring-[#7DB8E0] focus:ring-2 cursor-pointer appearance-none rounded-full bg-white ${
          props.checked ? 'border-[#7DB8E0]' : 'border-gray-300'
        } ${className}`}
          style={{
            ...(props.checked && {
              backgroundImage: 'radial-gradient(circle, white 6px, #7DB8E0 6px, #7DB8E0 100%)',
            }),
          }}
        {...props}
      />
      <div className="flex-1">
        <label
          htmlFor={radioId}
          className="block text-base font-medium text-gray-900 cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
};

