import type { MissionDayStatus } from './missionHistory.types';

export interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
  getDayStatus?: (date: Date) => MissionDayStatus;
  getDayHabits?: (date: Date) => boolean;
  getDayChallenges?: (date: Date) => boolean;
  getDayTodos?: (date: Date) => boolean;
  className?: string;
  isLoading?: boolean;
}

