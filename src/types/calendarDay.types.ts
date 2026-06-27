import type { MissionDayStatus } from './missionHistory.types';

export interface CalendarDayProps {
  status: MissionDayStatus;
  date: Date;
  isSelected?: boolean;
  isNeighboringMonth?: boolean;
  hasHabits?: boolean;
  hasChallenges?: boolean;
  hasTodos?: boolean;
  onClick?: (date: Date) => void;
  isLoading?: boolean;
}

