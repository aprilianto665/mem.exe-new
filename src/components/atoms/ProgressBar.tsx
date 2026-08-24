import type { ProgressBarProps } from '../../types/progressBar.types';

export const ProgressBar = ({
  current,
  target,
  projected = 0,
  variant = 'blue',
  className = '',
}: ProgressBarProps) => {
  const currentPct = Math.min((current / target) * 100, 100);
  const projectedPct = Math.min(((current + projected) / target) * 100, 100);
  const additionalPct = Math.max(0, projectedPct - currentPct);

  const colorClasses = {
    blue: 'bg-[#7DB8E0]',
    purple: 'bg-[#A78BFA]',
    amber: 'bg-amber-400',
    emerald: 'bg-emerald-400',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden flex relative">
        <div
          className={`h-2.5 rounded-l-full transition-all duration-300 ease-out ${colorClasses[variant]} ${additionalPct === 0 ? 'rounded-r-full' : ''}`}
          style={{ width: `${currentPct}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={target}
        />
        {additionalPct > 0 && (
          <div
            className="h-2.5 bg-amber-400/80 rounded-r-full animate-pulse transition-all duration-300"
            style={{ width: `${additionalPct}%` }}
          />
        )}
      </div>
    </div>
  );
};
