export type ProgressBarVariant = 'blue' | 'purple' | 'amber' | 'emerald';

export interface ProgressBarProps {
  current: number;
  target: number;
  projected?: number;
  variant?: ProgressBarVariant;
  className?: string;
}
