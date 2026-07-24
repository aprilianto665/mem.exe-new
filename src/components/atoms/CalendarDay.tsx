import type { CalendarDayProps } from '../../types/calendarDay.types';

export const CalendarDay = ({
  status,
  date,
  isSelected = false,
  isNeighboringMonth = false,
  hasHabits = false,
  hasChallenges = false,
  hasTodos = false,
  onClick,
  isLoading = false,
}: CalendarDayProps) => {
  const dayNumber = date.getDate();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      onClick(date);
    }
  };

  const getStatusMark = () => {
    // Hide status mark when day is from neighboring month
    if (isNeighboringMonth) {
      return null;
    }

    if (isLoading) {
      return (
        <div className="w-2 h-2 bg-gray-200 rounded-full absolute bottom-1 left-1/2 -translate-x-1/2 animate-pulse" />
      );
    }
    
    switch (status) {
      case 'success':
        return (
          <div className="w-2 h-2 bg-green-400 rounded-full absolute bottom-1 left-1/2 -translate-x-1/2" />
        );
      case 'failed':
        return (
          <div className="w-2 h-2 bg-red-400 rounded-full absolute bottom-1 left-1/2 -translate-x-1/2" />
        );
      case 'has-missions': {
        const dots = [];
        if (hasHabits) {
          dots.push(<div key="habit" className="w-2 h-2 bg-[#7DB8E0] rounded-full" />);
        }
        if (hasChallenges) {
          dots.push(<div key="challenge" className="w-2 h-2 bg-[#A78BFA] rounded-full" />);
        }
        if (hasTodos) {
          dots.push(<div key="todo" className="w-2 h-2 bg-amber-400 rounded-full" />);
        }

        if (dots.length > 0) {
          return (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 items-center justify-center">
              {dots}
            </div>
          );
        }
        // Fallback if no details
        return (
          <div className="w-2 h-2 bg-[#7DB8E0] rounded-full absolute bottom-1 left-1/2 -translate-x-1/2" />
        );
      }
      case 'normal':
      default:
        return null;
    }
  };

  const baseStyles =
    'relative w-full h-full flex items-center justify-center text-sm p-2 sm:p-3';
  
  // Text color logic
  let textColorClass = '';
  if (isSelected) {
    textColorClass = 'text-gray-800';
  } else if (isNeighboringMonth) {
    textColorClass = 'text-gray-400';
  } else if (status === 'normal') {
    textColorClass = 'text-gray-700';
  } else {
    textColorClass = 'text-gray-800';
  }

  const selectedStyles = isSelected
    ? 'bg-[#7DB8E0]/20 font-bold rounded-full'
    : 'font-medium';

  const clickableStyles = onClick ? 'cursor-pointer' : '';

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      className={`${baseStyles} ${textColorClass} ${selectedStyles} ${clickableStyles} focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 active:outline-none active:ring-0`}
      onClick={handleClick}
      aria-label={onClick ? `Date ${date.toLocaleDateString()}, Status: ${status}` : undefined}
    >
      {dayNumber}
      {getStatusMark()}
    </Component>
  );
};

