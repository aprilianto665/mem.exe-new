import type { ButtonHTMLAttributes } from 'react';

export interface CapsuleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
  transparentInactive?: boolean;
}
