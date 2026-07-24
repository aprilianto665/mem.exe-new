import type { MissionListProps } from '../../types/missionList.types';
import { MissionCard } from '../molecules/MissionCard';
import { Text } from '../atoms/Text';

export const MissionList = ({
  missions,
  onStartMission,
  onDeleteMission,
}: MissionListProps) => {
  if (missions.length === 0) {
    return (
      <div className="text-center py-12">
        <Text size="lg" className="text-gray-500">
          No missions available
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {missions.map((mission) => (
        <MissionCard
          key={mission.id}
          mission={mission}
          onStart={onStartMission}
          onDelete={onDeleteMission}
        />
      ))}
    </div>
  );
};

