import type { ProgressBarProps } from '../../types/progressBar.types';

export const ProgressBar = ({
  current,
  target,
  variant = 'blue',
  className = '',
}: ProgressBarProps) => {
  const percentage = Math.min((current / target) * 100, 100);

  const colorClasses = {
    blue: 'bg-[#7DB8E0]',
    purple: 'bg-[#A78BFA]',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ease-out ${colorClasses[variant]}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={target}
        />
      </div>
    </div>
  );
};

