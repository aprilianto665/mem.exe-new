import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

export interface CapsuleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
  transparentInactive?: boolean;
}

export const CapsuleButton = forwardRef<HTMLButtonElement, CapsuleButtonProps>(({
  active = false,
  children,
  className = '',
  transparentInactive = false,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={`px-6 py-2.5 rounded-full font-medium text-base cursor-pointer ${
        active
          ? 'bg-[#7DB8E0] text-white'
          : transparentInactive
          ? 'bg-transparent text-gray-700'
          : 'bg-[#E5E7EB] text-gray-700 hover:bg-gray-300'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

CapsuleButton.displayName = 'CapsuleButton';
