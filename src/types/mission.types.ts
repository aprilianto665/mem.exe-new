import type { CommitmentType } from './commitmentTypeSelector.types';
import type { CommitmentLevel } from '../components/molecules/CommitmentLevelSelector';
import type { FrequencyType, DayOfWeek } from './frequencySelector.types';

export type MissionStatus = 'draft' | 'active' | 'completed' | 'canceled';

export interface Mission {
  id: string;
  name: string;
  reason?: string;
  commitmentType: CommitmentType;
  commitmentLevel: CommitmentLevel;
  frequency: FrequencyType;
  selectedDays?: DayOfWeek[];
  duration?: number; // Only for challenges
  currentDays?: number; // Progress days for challenges
  minutesPerDay: number;
  targetMinutes: number;
  currentMinutes: number;
  status?: MissionStatus; // Mission status: draft, active, completed, or canceled
  streak?: number; // Consecutive days completed
  missed?: number; // Total days missed
  linkedMilestoneId?: string;
  timerStartedAt?: string;
  loggedMinutes?: number;
  loggedSeconds?: number;
  startDate?: string;
  totalMinutesDone?: number;
  averageMinutesDone?: number;
}

