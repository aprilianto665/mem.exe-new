import { useState, useCallback } from 'react';
import type { TimelineCalendarProps } from '../../types/timelineCalendar.types';
import type { MissionDayStatus } from '../../types/missionHistory.types';
import { Calendar } from '../molecules/Calendar';
import { useMissionStore } from '../../store/missionStore';
import { toLocalYYYYMMDD } from '../../data/missionHistory';

export const TimelineCalendar = ({
  selectedDate,
  onDateChange,
  onMonthChange,
  className = '',
}: TimelineCalendarProps) => {
  const { monthlyTimeline, isLoading } = useMissionStore();
  const [currentSelectedDate, setCurrentSelectedDate] = useState<Date>(
    selectedDate || new Date()
  );

  const getDayInfo = useCallback(
    (date: Date) => {
      const dateStr = toLocalYYYYMMDD(date);
      return monthlyTimeline.find((d) => d.date === dateStr);
    },
    [monthlyTimeline]
  );

  const handleGetDayStatus = useCallback(
    (date: Date): MissionDayStatus => {
      return getDayInfo(date)?.status || 'normal';
    },
    [getDayInfo]
  );

  const handleGetDayHabits = useCallback(
    (date: Date): boolean => {
      return getDayInfo(date)?.has_habits || false;
    },
    [getDayInfo]
  );

  const handleGetDayChallenges = useCallback(
    (date: Date): boolean => {
      return getDayInfo(date)?.has_challenges || false;
    },
    [getDayInfo]
  );

  const handleGetDayTodos = useCallback(
    (date: Date): boolean => {
      return getDayInfo(date)?.has_todos || false;
    },
    [getDayInfo]
  );

  const handleDateChange = useCallback(
    (date: Date) => {
      setCurrentSelectedDate(date);
      onDateChange?.(date);
    },
    [onDateChange]
  );

  return (
    <div className={className}>
      <Calendar
        value={currentSelectedDate}
        onChange={handleDateChange}
        onMonthChange={onMonthChange}
        getDayStatus={handleGetDayStatus}
        getDayHabits={handleGetDayHabits}
        getDayChallenges={handleGetDayChallenges}
        getDayTodos={handleGetDayTodos}
        isLoading={isLoading}
      />
    </div>
  );
};

