import type { InputHTMLAttributes } from 'react';

export type InputVariant = 'default' | 'noBorder';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: InputVariant;
}

