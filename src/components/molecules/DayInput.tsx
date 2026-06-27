import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CapsuleButton } from '../atoms/CapsuleButton';
import { Input } from '../atoms/Input';
import type { DayInputProps } from '../../types/dayInput.types';

const PRESET_DAYS = [30, 60, 90] as const;
const MIN_DAYS = 7;
const MAX_DAYS = 365;

const isPresetValue = (days: number): boolean => {
  return PRESET_DAYS.includes(days as typeof PRESET_DAYS[number]);
};

const isValidCustomDays = (days: number): boolean => {
  return days >= MIN_DAYS && days <= MAX_DAYS;
};

export const DayInput = ({ value, onChange }: DayInputProps) => {
  // Track if user selected custom mode (independent of value)
  const [isCustomMode, setIsCustomMode] = useState<boolean>(() => {
    return !isPresetValue(value);
  });

  // null = not initialized, '' = user cleared, '123' = user input
  const [customDaysInput, setCustomDaysInput] = useState<string | null>(() => {
    return isCustomMode && value > 0 ? value.toString() : null;
  });
  
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  const handlePresetChange = (days: number) => {
    setIsCustomMode(false);
    setCustomDaysInput(null);
    setShowPlaceholder(false);
    onChange(days);
  };

  const handleCustomRadioChange = () => {
    setIsCustomMode(true);
    
    if (customDaysInput === '') {
      setShowPlaceholder(true);
      return;
    }

    if (customDaysInput !== null && customDaysInput !== '') {
      const parsedInput = parseInt(customDaysInput);
      if (isValidCustomDays(parsedInput)) {
        setShowPlaceholder(false);
        onChange(parsedInput);
        return;
      }
    }

    // Only sync if null (never set), not if cleared (empty string)
    if (customDaysInput === null && isCustomMode && isValidCustomDays(value) && value !== MIN_DAYS) {
      setCustomDaysInput(value.toString());
      setShowPlaceholder(false);
      onChange(value);
      return;
    }

    setCustomDaysInput(null);
    setShowPlaceholder(true);
    if (!isCustomMode) {
      onChange(MIN_DAYS);
    }
  };

  const handleCustomDaysKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
    ) {
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      return;
    }

    if (e.key === '-' || e.key === '+' || e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      return;
    }

    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    // Prevent typing '0' only if input is empty (will become "0" alone)
    // Allow "0" in middle/end (like "10", "20", "100", "305")
    if (e.key === '0') {
      const input = e.currentTarget;
      const currentValue = input.value;
      
      // Block only if input is completely empty
      if (currentValue === '') {
        e.preventDefault();
        return;
      }
    }
  };

  const handleCustomDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^0-9]/g, '');
    
    // Remove leading zeros (e.g., "007" -> "7", "01" -> "1")
    // But keep "0" in middle/end (e.g., "10", "20", "100", "305")
    inputValue = inputValue.replace(/^0+/, '');
    
    if (inputValue.length > 3) {
      inputValue = inputValue.slice(0, 3);
    }
    
    setCustomDaysInput(inputValue);
    setShowPlaceholder(false);
    
    if (inputValue === '') {
      return;
    }

    const numValue = parseInt(inputValue);
    if (!isNaN(numValue) && numValue > 0 && isValidCustomDays(numValue)) {
      onChange(numValue);
    }
  };

  const getInputValue = (): string => {
    if (showPlaceholder) return '';
    // customDaysInput is source of truth if set (null = not initialized, '' = cleared, '123' = value)
    if (customDaysInput !== null) return customDaysInput;
    if (isCustomMode && value !== MIN_DAYS) return value.toString();
    return '';
  };

  // Refs for animation
  const containerRef = useRef<HTMLDivElement>(null);
  const button30Ref = useRef<HTMLButtonElement>(null);
  const button60Ref = useRef<HTMLButtonElement>(null);
  const button90Ref = useRef<HTMLButtonElement>(null);
  const buttonCustomRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const hasMountedRef = useRef(false);
  const indicatorRef = useRef<HTMLDivElement>(null);

  // Determine active index
  const getActiveIndex = () => {
    if (isCustomMode) return 3; // Custom is last
    if (value === 30) return 0;
    if (value === 60) return 1;
    if (value === 90) return 2;
    return 0;
  };

  const activeIndex = getActiveIndex();

  const updateIndicatorPosition = useCallback(() => {
    const buttonRefs = [button30Ref, button60Ref, button90Ref, buttonCustomRef];
    const activeButton = buttonRefs[activeIndex]?.current;
    const container = containerRef.current;
    
    if (activeButton && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeIndex]);

  useLayoutEffect(() => {
    updateIndicatorPosition();
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      // Disable transition on initial mount to prevent animation on first render
      if (indicatorRef.current) {
        indicatorRef.current.style.transition = 'none';
        requestAnimationFrame(() => {
          if (indicatorRef.current) {
            indicatorRef.current.style.transition = '';
          }
        });
      }
    }
  }, [updateIndicatorPosition]);

  // Use ResizeObserver to detect layout changes from sibling components
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      // Use requestAnimationFrame to ensure DOM has settled after layout changes
      requestAnimationFrame(() => {
        updateIndicatorPosition();
      });
    });

    resizeObserver.observe(container);

    // Also observe parent to catch position shifts
    const parent = container.parentElement;
    if (parent) {
      resizeObserver.observe(parent);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateIndicatorPosition]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicatorPosition);
    return () => window.removeEventListener('resize', updateIndicatorPosition);
  }, [updateIndicatorPosition]);

  return (
    <div className="space-y-3">
      <div ref={containerRef} className="relative flex justify-between gap-1 rounded-full p-1 bg-[#F8FAFC]">
        {/* Sliding Background Indicator */}
        <div
          ref={indicatorRef}
          className="absolute top-1 bottom-1 bg-[#7DB8E0] rounded-full transition-all duration-300 ease-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />
        
        {PRESET_DAYS.map((days, index) => {
          const isSelected = !isCustomMode && value === days;
          const buttonRefs = [button30Ref, button60Ref, button90Ref];
          return (
            <CapsuleButton
              key={days}
              ref={buttonRefs[index]}
              active={isSelected}
              onClick={() => handlePresetChange(days)}
              className={`flex-1 relative z-10 ${isSelected ? 'text-white !bg-transparent' : ''}`}
              transparentInactive
            >
              {days}
            </CapsuleButton>
          );
        })}
        <CapsuleButton
          ref={buttonCustomRef}
          active={isCustomMode}
          onClick={handleCustomRadioChange}
          className={`flex-1 relative z-10 ${isCustomMode ? 'text-white !bg-transparent' : ''}`}
          transparentInactive
        >
          Custom
        </CapsuleButton>
      </div>
      
      <div
        className="overflow-hidden"
        style={{
          maxHeight: isCustomMode ? '100px' : '0',
          opacity: isCustomMode ? 1 : 0,
          transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out',
        }}
      >
        <div className="w-full">
          <Input
            type="number"
            min={MIN_DAYS}
            max={MAX_DAYS}
            maxLength={3}
            placeholder={`Enter days (Min: ${MIN_DAYS}, Max: ${MAX_DAYS})`}
            value={getInputValue()}
            onChange={handleCustomDaysChange}
            onKeyDown={handleCustomDaysKeyDown}
            variant="noBorder"
            className="w-full [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
          />
        </div>
      </div>
    </div>
  );
};

