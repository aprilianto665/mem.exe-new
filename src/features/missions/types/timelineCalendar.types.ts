import type { Mission } from './mission.types';
import type { Milestone } from '../store/missionStore';

export interface TimelineCalendarProps {
  missions?: Mission[];
  milestones?: Milestone[];
  history?: any[];
  selectedDate?: Date;
  onDateSelect?: (dayData: any) => void;
  onMonthChange?: (date: Date) => void;
  onDateChange?: (date: Date) => void;
  className?: string;
}

