import type { ProgressBarProps } from '../../types/progressBar.types';

export const ProgressBar = ({
  current,
  target,
  projected = 0,
  variant = 'blue',
  className = '',
  children,
  label,
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

  const content = children || label;

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-100 rounded-full h-7 relative flex items-center shadow-inner border border-gray-200/60 overflow-hidden">
        {/* Inset progress container for offset gap */}
        <div className="absolute inset-1 rounded-full overflow-hidden z-0 pointer-events-none">
          <div
            className={`h-full absolute inset-y-0 left-0 transition-all duration-300 ease-out ${colorClasses[variant]} ${additionalPct === 0 ? 'rounded-full' : 'rounded-l-full'}`}
            style={{ width: `${currentPct}%` }}
            role="progressbar"
            aria-valuenow={current}
            aria-valuemin={0}
            aria-valuemax={target}
          />
          {additionalPct > 0 && (
            <div
              className="h-full absolute inset-y-0 bg-amber-300/90 rounded-r-full transition-all duration-300"
              style={{ left: `${currentPct}%`, width: `${additionalPct}%` }}
            />
          )}
        </div>
        {content && (
          <div className="relative z-10 w-full flex justify-end items-center px-3.5 pointer-events-none select-none">
            {content}
          </div>
        )}
      </div>
    </div>
  );
};
