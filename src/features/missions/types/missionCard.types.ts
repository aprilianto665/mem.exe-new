import type { Mission } from './mission.types';

export interface MissionCardProps {
  mission: Mission;
  onStart?: (missionId: string) => void;
  onDelete?: (missionId: string) => void;
}

