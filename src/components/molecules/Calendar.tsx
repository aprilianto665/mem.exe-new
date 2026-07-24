import { useState } from 'react';
import ReactCalendar from 'react-calendar';
import type { CalendarProps } from '../../types/calendar.types';
import type { MissionDayStatus } from '../../types/missionHistory.types';
import { CalendarDay } from '../atoms/CalendarDay';
import { CalendarLegend } from './CalendarLegend';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';

export const Calendar = ({
  value,
  onChange,
  onMonthChange,
  getDayStatus,
  getDayHabits,
  getDayChallenges,
  getDayTodos,
  className = '',
  isLoading = false,
}: CalendarProps) => {
  const [activeStartDate, setActiveStartDate] = useState<Date>(
    value || new Date()
  );

  const handleDateChange = (date: Date) => {
    onChange?.(date);
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') {
      return null;
    }

    // Check if date is from neighboring month
    const isNeighboringMonth = date.getMonth() !== activeStartDate.getMonth();
    
    const status: MissionDayStatus = getDayStatus?.(date) || 'normal';
    const isSelected = value && date.toDateString() === value.toDateString();
    const hasHabits = getDayHabits?.(date) || false;
    const hasChallenges = getDayChallenges?.(date) || false;
    const hasTodos = getDayTodos?.(date) || false;

    return (
      <CalendarDay
        status={status}
        date={date}
        isSelected={isSelected}
        isNeighboringMonth={isNeighboringMonth}
        hasHabits={hasHabits}
        hasChallenges={hasChallenges}
        hasTodos={hasTodos}
        isLoading={isLoading}
      />
    );
  };

  return (
    <div
      className={`bg-white rounded-3xl ${className}`}
      style={{
        boxShadow:
          '0 4px 6px -1px rgba(125, 184, 224, 0.2), 0 2px 4px -1px rgba(125, 184, 224, 0.1)',
      }}
    >
      <div className="calendar-wrapper p-4">
        <ReactCalendar
          value={value}
          onChange={(date) => {
            if (date instanceof Date) {
              handleDateChange(date);
            } else if (Array.isArray(date) && date[0] instanceof Date) {
              handleDateChange(date[0]);
            }
          }}
          onActiveStartDateChange={({ activeStartDate }) => {
            if (activeStartDate instanceof Date) {
              setActiveStartDate(activeStartDate);
              onMonthChange?.(activeStartDate);
            }
          }}
          activeStartDate={activeStartDate}
          tileContent={tileContent}
          calendarType="gregory"
          showNeighboringMonth={true}
          className="custom-calendar"
        />
      </div>
      <div className="px-4 pb-4 mt-4">
        <CalendarLegend />
      </div>
    </div>
  );
};

