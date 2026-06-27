import type { Mission } from './mission.types';

export interface MissionListProps {
  missions: Mission[];
  onStartMission: (missionId: string) => void;
  onDeleteMission?: (missionId: string) => void;
}

