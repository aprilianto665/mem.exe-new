import type { TextareaHTMLAttributes } from 'react';

export type TextareaVariant = 'default' | 'noBorder';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  variant?: TextareaVariant;
}

