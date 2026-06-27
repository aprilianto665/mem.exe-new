import { useEffect, useLayoutEffect, useRef } from 'react';
import { CapsuleButton } from '../atoms/CapsuleButton';
import { InfoBox } from '../atoms/InfoBox';

export type CommitmentLevel = 'normal' | 'hard' | 'extreme';

export interface CommitmentLevelSelectorProps {
  value: CommitmentLevel;
  onChange: (value: CommitmentLevel) => void;
}

interface CommitmentLevelDetails {
  subtitle: string;
  singleFailure: string[];
  consecutiveFailures: string[];
  recommendation: string;
}

const commitmentDetails: Record<CommitmentLevel, CommitmentLevelDetails> = {
  normal: {
    subtitle: 'For building identity and consistency, with zero pressure.',
    singleFailure: [
      "Tomorrow's target stays the same.",
      'The day is simply marked as missed.',
      "Your streak resets."
    ],
    consecutiveFailures: [
      'After 2 days in a row missed, tomorrow you only need to show up for the first 5 minutes.'
    ],
    recommendation:
      'Normal never punishes you; it only reminds you of the commitment you chose.',
  },
  hard: {
    subtitle: 'For users who consciously want controlled pressure to grow faster.',
    singleFailure: [
      "Tomorrow’s target increases by +5 minutes.",
      'The day is simply marked as missed.',
      "Your streak resets."
    ],
    consecutiveFailures: [
      'Each missed day adds another +5 minutes.',
      'The increase is capped at +20 minutes above your base target.',
      'Completing 3 days in a row reduces the target by −5 minutes (until it returns to base).'
    ],
    recommendation: 'Hard applies controlled pressure misses make it harder, consistency makes it lighter.',
  },
  extreme: {
    subtitle: 'A deliberate commitment with stronger consequences.',
    singleFailure: [
      "Tomorrow’s target increases by +10 minutes.",
      'The day is simply marked as missed.',
      "Your streak resets."
    ],
    consecutiveFailures: [
      'Each missed day adds another +10 minutes.',
      'The increase is capped at +30 minutes above your base target.',
      'Completing 3 days in a row reduces the target by −5 minutes (until it returns to base).'
    ],
    recommendation:
      'Extreme reacts fast to missed days and recovers slowly consistency must be earned.',
  },
};

export const CommitmentLevelSelector = ({
  value,
  onChange,
}: CommitmentLevelSelectorProps) => {
  const details = commitmentDetails[value];
  const containerRef = useRef<HTMLDivElement>(null);
  const normalButtonRef = useRef<HTMLButtonElement>(null);
  const hardButtonRef = useRef<HTMLButtonElement>(null);
  const extremeButtonRef = useRef<HTMLButtonElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const levels: CommitmentLevel[] = ['normal', 'hard', 'extreme'];
  const activeIndex = levels.indexOf(value);

  const updatePosition = () => {
    const indicator = indicatorRef.current;
    if (!indicator) return;

    const buttonRefs = [normalButtonRef, hardButtonRef, extremeButtonRef];
    const activeButton = buttonRefs[activeIndex]?.current;
    const container = containerRef.current;
    
    if (activeButton && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      
      indicator.style.left = `${buttonRect.left - containerRect.left}px`;
      indicator.style.width = `${buttonRect.width}px`;
    }
  };

  useLayoutEffect(() => {
    updatePosition();
  });

  useEffect(() => {
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  });

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="relative flex justify-between gap-1 rounded-full p-1 bg-[#F8FAFC]">
        {/* Sliding Background Indicator */}
        <div
          ref={indicatorRef}
          className="absolute top-1 bottom-1 bg-[#7DB8E0] rounded-full transition-all duration-300 ease-out"
        />
        
        <CapsuleButton
          ref={normalButtonRef}
          active={value === 'normal'}
          onClick={() => onChange('normal')}
          className={`flex-1 relative z-10 ${value === 'normal' ? 'text-white !bg-transparent' : ''}`}
          transparentInactive
        >
          Normal
        </CapsuleButton>
        <CapsuleButton
          ref={hardButtonRef}
          active={value === 'hard'}
          onClick={() => onChange('hard')}
          className={`flex-1 relative z-10 ${value === 'hard' ? 'text-white !bg-transparent' : ''}`}
          transparentInactive
        >
          Hard
        </CapsuleButton>
        <CapsuleButton
          ref={extremeButtonRef}
          active={value === 'extreme'}
          onClick={() => onChange('extreme')}
          className={`flex-1 relative z-10 ${value === 'extreme' ? 'text-white !bg-transparent' : ''}`}
          transparentInactive
        >
          Extreme
        </CapsuleButton>
      </div>
      <InfoBox variant="warning" title={`${value.charAt(0).toUpperCase() + value.slice(1)} — ${value === 'normal' ? 'Consistency First' : value === 'hard' ? 'Growth Mode' : 'Contract Mode'}`}>
        <div className="space-y-4 mt-2">
          <p className="italic text-gray-600">{details.subtitle}</p>
          
          <div>
            <p className="font-semibold text-gray-700 mb-2">If you miss one day:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 marker:text-[#FDD2AE]">
              {details.singleFailure.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-gray-700 mb-2">If days are missed consecutively:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 marker:text-[#FDD2AE]">
              {details.consecutiveFailures.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <p className="text-gray-600 mt-4">{details.recommendation}</p>
        </div>
      </InfoBox>
    </div>
  );
};
