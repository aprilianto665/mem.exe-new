import type { Mission } from './mission.types';

export type MissionDayStatus = 'success' | 'failed' | 'has-missions' | 'normal';

export type MissionCompletionStatus = 'completed' | 'failed' | 'pending';

export interface MissionCompletion {
  missionId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  status: MissionCompletionStatus;
  completedMinutes?: number;
  targetMinutes?: number;
}

export interface DayMissionData {
  date: string; // ISO date string (YYYY-MM-DD)
  status: MissionDayStatus;
  missions: Array<{
    mission: Mission;
    completion?: MissionCompletion;
  }>;
  milestones?: Array<{
    id: string;
    title: string;
    description?: string;
    deadline?: string;
    status: 'active' | 'completed';
  }>;
}

