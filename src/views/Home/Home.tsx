import { useEffect } from 'react';
import { PageTemplate } from '../../components/templates/PageTemplate';
import { MissionList } from '../../components/organisms/MissionList';
import { Text } from '../../components/atoms/Text';
import { useMissionStore } from '../../store/missionStore';
import { isMissionScheduled } from '../../data/missionHistory';
import { 
  BoltIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const Home = () => {
  const { 
    missions, 
    error,
    isLoading,
    fetchDailyMissions,
    deleteMission, 
    logMinutes
  } = useMissionStore();

  useEffect(() => {
    fetchDailyMissions();
  }, [fetchDailyMissions]);

  if (isLoading && missions.length === 0) {
    return (
      <PageTemplate>
        <div className="flex flex-col min-h-screen pb-32">
          {/* Top Premium Welcome Header */}
          <div className="flex-shrink-0 mb-6 text-center">
            <Text size="2xl" weight="bold" className="text-gray-800 mb-1">
              Discipline Dashboard
            </Text>
            <Text size="sm" className="text-gray-500 font-medium">
              Program daily habits to achieve your ultimate lifetime milestones.
            </Text>
          </div>

          {/* Premium Skeleton Loading Cards */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Left Icon Skeleton */}
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex-shrink-0" />
                  {/* Text Skeletons */}
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded-md w-1/3" />
                    <div className="h-3 bg-gray-50 rounded-md w-2/3" />
                  </div>
                </div>
                {/* Button Skeleton */}
                <div className="w-24 h-10 bg-gray-100 rounded-2xl flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </PageTemplate>
    );
  }

  const activeTodayMissions = missions.filter(m => m.status !== 'canceled');

  // Mission list handlers
  const handleStartMission = async (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    try {
      await logMinutes(missionId, 15);
      const current = Math.min(mission.targetMinutes, mission.currentMinutes + 15);
      if (current >= mission.targetMinutes) {
        toast.success(`Mission "${mission.name}" completed! Great job!`);
      } else {
        toast.success(`Logged 15 mins of practice for "${mission.name}"! (${current}/${mission.targetMinutes}m)`);
      }
    } catch (err: any) {
      toast.error('Connection error. Unable to log progress.');
    }
  };

  const handleDeleteMission = async (missionId: string) => {
    try {
      await deleteMission(missionId);
      toast.success('Mission canceled.');
    } catch (err: any) {
      toast.error('Connection error. Unable to cancel mission.');
    }
  };

  return (
    <PageTemplate>
      <div className="flex flex-col min-h-screen pb-32">
        
        {/* Top Premium Welcome Header */}
        <div className="flex-shrink-0 mb-6 text-center">
          <Text size="2xl" weight="bold" className="text-gray-800 mb-1">
            Discipline Dashboard
          </Text>
          <Text size="sm" className="text-gray-500 font-medium">
            Program daily habits to achieve your ultimate lifetime milestones.
          </Text>
        </div>

        {/* Premium Offline Warning banner */}
        {error && (
          <div className="flex-shrink-0 mb-6 bg-amber-50 border border-amber-200 rounded-3xl p-4 flex items-center gap-3 max-w-md mx-auto shadow-sm animate-fadeIn">
            <BoltIcon className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <Text size="sm" weight="semibold" className="text-amber-800">
                Sync Connection Issue
              </Text>
              <Text size="xs" className="text-amber-600 mt-0.5">
                We are having trouble syncing your progress. Please check your network connection or try again later.
              </Text>
            </div>
          </div>
        )}

        {/* Daily Habits List */}
        <div className="space-y-4 animate-fadeIn">

          <MissionList 
            missions={activeTodayMissions} 
            onStartMission={handleStartMission}
            onDeleteMission={handleDeleteMission}
          />
        </div>

      </div>
    </PageTemplate>
  );
};
