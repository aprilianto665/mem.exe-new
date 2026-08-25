import type { ProgressBarProps } from '../../types/progressBar.types';

export const ProgressBar = ({
  current,
  target,
  projected = 0,
  variant = 'blue',
  className = '',
  children,
  label,
  isRunning = false,
}: ProgressBarProps) => {
  const currentPct = Math.min((current / target) * 100, 100);
  const projectedPct = Math.min(((current + projected) / target) * 100, 100);
  const additionalPct = Math.max(0, projectedPct - currentPct);
  const effectivePct = Math.max(currentPct, projectedPct);

  const colorClasses = {
    blue: 'bg-[#7DB8E0]',
    purple: 'bg-[#A78BFA]',
    amber: 'bg-amber-400',
    emerald: 'bg-emerald-400',
  };

  const content = children || label;

  const stripeStyle = isRunning ? {
    backgroundImage: 'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.25) 0, rgba(255, 255, 255, 0.25) 8px, transparent 8px, transparent 16px)',
  } : undefined;

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-100 rounded-xl h-7 relative flex items-center shadow-inner border border-gray-200/60 overflow-hidden">
        {/* Dark text layer (visible over light gray background track) */}
        {content && (
          <div className={`absolute inset-0 z-0 w-full flex justify-end items-center pr-3.5 pointer-events-none select-none ${isRunning ? 'text-emerald-600' : 'text-gray-800'}`}>
            {content}
          </div>
        )}

        {/* Inset progress container for offset gap */}
        <div className="absolute inset-1 rounded-lg overflow-hidden z-10 pointer-events-none">
          {/* Main Progress Bar Fill */}
          <div
            className={`h-full absolute inset-y-0 left-0 transition-all duration-300 ease-out overflow-hidden ${colorClasses[variant]} ${additionalPct === 0 ? 'rounded-lg' : 'rounded-l-lg'}`}
            style={{ width: `${currentPct}%` }}
            role="progressbar"
            aria-valuenow={current}
            aria-valuemin={0}
            aria-valuemax={target}
          >
            {isRunning && (
              <div 
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={stripeStyle}
              />
            )}
          </div>

          {/* Projected Progress Bar Fill (e.g. Pomodoro Session) */}
          {additionalPct > 0 && (
            <div
              className="h-full absolute inset-y-0 bg-amber-300/90 rounded-r-lg transition-all duration-300 overflow-hidden"
              style={{ left: `${currentPct}%`, width: `${additionalPct}%` }}
            >
              {isRunning && (
                <div 
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={stripeStyle}
                />
              )}
            </div>
          )}

          {/* Light/White text layer (clipped to exact progress bar width) */}
          {content && (
            <div 
              className="absolute inset-0 w-full flex justify-end items-center pr-[10px] pointer-events-none select-none text-white font-bold transition-all duration-300"
              style={{
                clipPath: `inset(0 ${Math.max(0, 100 - effectivePct)}% 0 0)`
              }}
            >
              {content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
