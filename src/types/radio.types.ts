import type { InputHTMLAttributes } from 'react';

export type RadioVariant = 'default' | 'card';

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  description?: string;
  variant?: RadioVariant;
}

