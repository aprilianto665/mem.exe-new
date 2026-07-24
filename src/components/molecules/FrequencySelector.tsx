import { useEffect, useLayoutEffect, useRef } from 'react';
import { Radio } from '../atoms/Radio';
import { CapsuleButton } from '../atoms/CapsuleButton';
import type { FrequencySelectorProps, DayOfWeek } from '../../types/frequencySelector.types';

const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: 0, label: 'Sun' }, // Sunday
  { value: 1, label: 'Mon' }, // Monday
  { value: 2, label: 'Tue' }, // Tuesday
  { value: 3, label: 'Wed' }, // Wednesday
  { value: 4, label: 'Thu' }, // Thursday
  { value: 5, label: 'Fri' }, // Friday
  { value: 6, label: 'Sat' }, // Saturday
];

const WEEKDAYS: DayOfWeek[] = [1, 2, 3, 4, 5]; // Mon-Fri
const WEEKENDS: DayOfWeek[] = [0, 6]; // Sun, Sat

interface WeekdayWeekendButtonGroupProps {
  isWeekdaysSelected: boolean;
  isWeekendsSelected: boolean;
  onWeekdaysClick: () => void;
  onWeekendsClick: () => void;
}

const WeekdayWeekendButtonGroup = ({
  isWeekdaysSelected,
  isWeekendsSelected,
  onWeekdaysClick,
  onWeekendsClick,
}: WeekdayWeekendButtonGroupProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const weekdaysButtonRef = useRef<HTMLButtonElement>(null);
  const weekendsButtonRef = useRef<HTMLButtonElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const activeIndex = isWeekdaysSelected ? 0 : isWeekendsSelected ? 1 : null;

  const updatePosition = () => {
    const indicator = indicatorRef.current;
    if (!indicator) return;

    if (activeIndex === null) {
      indicator.style.left = '0px';
      indicator.style.width = '0px';
      return;
    }

    const buttonRefs = [weekdaysButtonRef, weekendsButtonRef];
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
    <div ref={containerRef} className="relative flex justify-between gap-1 rounded-full p-1 bg-gray-200">
      {/* Sliding Background Indicator */}
      {activeIndex !== null && (
        <div
          ref={indicatorRef}
          className="absolute top-1 bottom-1 bg-[#7DB8E0] rounded-full transition-all duration-300 ease-out"
        />
      )}
      
      <CapsuleButton
        ref={weekdaysButtonRef}
        active={isWeekdaysSelected}
        onClick={onWeekdaysClick}
        className={`flex-1 relative z-10 ${isWeekdaysSelected ? 'text-white !bg-transparent' : ''}`}
        transparentInactive
      >
        Weekdays
      </CapsuleButton>
      <CapsuleButton
        ref={weekendsButtonRef}
        active={isWeekendsSelected}
        onClick={onWeekendsClick}
        className={`flex-1 relative z-10 ${isWeekendsSelected ? 'text-white !bg-transparent' : ''}`}
        transparentInactive
      >
        Weekends
      </CapsuleButton>
    </div>
  );
};

export const FrequencySelector = ({
  value,
  onChange,
  selectedDays = [1, 2, 3, 4, 5],
  onDaysChange,
}: FrequencySelectorProps) => {
  const handleDayToggle = (day: DayOfWeek) => {
    if (!onDaysChange) return;
    
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day].sort((a, b) => a - b);
    
    // Ensure at least one day is selected
    if (newSelectedDays.length > 0) {
      onDaysChange(newSelectedDays);
    }
  };

  const handlePresetClick = (presetDays: DayOfWeek[]) => {
    if (onDaysChange) {
      onDaysChange(presetDays);
    }
  };

  const isWeekdaysSelected = WEEKDAYS.every((day) => selectedDays.includes(day)) && 
                             selectedDays.length === WEEKDAYS.length;
  const isWeekendsSelected = WEEKENDS.every((day) => selectedDays.includes(day)) && 
                             selectedDays.length === WEEKENDS.length;

  return (
    <div className="space-y-3">
      <div
        className={`rounded-2xl p-4 bg-[#F8FAFC] cursor-pointer border-2 ${
          value === 'everyday'
            ? 'border-[#7DB8E0]'
            : 'border-transparent'
        }`}
        onClick={() => onChange('everyday')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onChange('everyday');
          }
        }}
      >
        <Radio
          label="Every Day"
          checked={value === 'everyday'}
          onChange={() => onChange('everyday')}
          name="frequency"
          variant="card"
        />
      </div>
      <div
        className={`rounded-2xl p-4 bg-[#F8FAFC] cursor-pointer border-2 ${
          value === 'custom'
            ? 'border-[#7DB8E0]'
            : 'border-transparent'
        }`}
        onClick={(e) => {
          // Only trigger if clicking on the container itself or the radio area, not on day selector
          if (!(e.target as HTMLElement).closest('[data-day-selector]')) {
            onChange('custom');
          }
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onChange('custom');
          }
        }}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <Radio
            label={
              <span className="flex items-center gap-2">
                Custom Days
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  ADVANCED
                </span>
                {value === 'custom' && selectedDays.length > 0 && (
                  <span className="text-xs font-medium text-[#7DB8E0]">
                    ({selectedDays.length} {selectedDays.length === 1 ? 'day' : 'days'})
                  </span>
                )}
              </span>
            }
            checked={value === 'custom'}
            onChange={() => onChange('custom')}
            name="frequency"
            variant="card"
          />
        </div>

        <div
          className="overflow-hidden"
          style={{
            maxHeight: value === 'custom' ? '500px' : '0',
            opacity: value === 'custom' ? 1 : 0,
            transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out',
          }}
        >
          <div className="mt-4 space-y-3" data-day-selector onClick={(e) => e.stopPropagation()}>
            {/* Quick Presets */}
            <WeekdayWeekendButtonGroup
              isWeekdaysSelected={isWeekdaysSelected}
              isWeekendsSelected={isWeekendsSelected}
              onWeekdaysClick={() => handlePresetClick(WEEKDAYS)}
              onWeekendsClick={() => handlePresetClick(WEEKENDS)}
            />

            {/* Day Buttons Grid */}
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDays.includes(day.value);
                return (
                  <CapsuleButton
                    key={day.value}
                    active={isSelected}
                    onClick={() => handleDayToggle(day.value)}
                    className={`min-w-[48px] px-3 py-2 ${
                      !isSelected ? '!bg-gray-200' : ''
                    }`}
                  >
                    {day.label}
                  </CapsuleButton>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
