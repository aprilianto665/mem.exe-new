export type ProgressBarVariant = 'blue' | 'purple';

export interface ProgressBarProps {
  current: number;
  target: number;
  variant?: ProgressBarVariant;
  className?: string;
}

