import { useState, useEffect } from 'react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import type { MissionCardProps } from '../../types/missionCard.types';
import { Text } from '../atoms/Text';
import { ProgressBar } from '../atoms/ProgressBar';
import { Button } from '../atoms/Button';
import { useMissionStore } from '../../store/missionStore';
import toast from 'react-hot-toast';

// Helper function to get commitment type label
const getCommitmentTypeLabel = (type: string): string => {
  return type === 'daily-habit' ? 'DAILY HABIT' : 'CHALLENGE';
};

export const MissionCard = ({ 
  mission 
}: MissionCardProps) => {
  const { startTimer, pauseTimer, fetchDailyMissions } = useMissionStore();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const isRunning = !!mission.timerStartedAt;

  useEffect(() => {
    if (!mission.timerStartedAt) {
      setElapsedSeconds(0);
      return;
    }

    const calculateElapsed = async () => {
      const startMs = new Date(mission.timerStartedAt!).getTime();
      const startDate = new Date(startMs);
      const now = new Date();

      const isDifferentDay =
        startDate.getDate() !== now.getDate() ||
        startDate.getMonth() !== now.getMonth() ||
        startDate.getFullYear() !== now.getFullYear();

      if (isDifferentDay) {
        toast.error('Timer dihentikan otomatis karena pergantian hari');
        try {
          await pauseTimer(mission.id, 0);
        } catch (e) {
          // ignore error if already stopped
        }
        await fetchDailyMissions();
        return;
      }

      const diffSecs = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      setElapsedSeconds(diffSecs);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);

    return () => clearInterval(interval);
  }, [mission.timerStartedAt, mission.id, pauseTimer, fetchDailyMissions]);

  const baseMinutes = mission.loggedMinutes || 0;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const currentMinutes = baseMinutes + elapsedMinutes;

  const isChallenge = mission.commitmentType === 'challenge';
  
  // Color configuration
  const accentColorClass = isChallenge ? 'text-purple-400' : 'text-[#7DB8E0]';
  const progressBarVariant = isChallenge ? 'purple' : 'blue';
  
  // Event handlers
  const handleToggleTimer = async () => {
    try {
      if (isRunning) {
        // Pausing
        const minsToLog = Math.floor(elapsedSeconds / 60);
        await pauseTimer(mission.id, minsToLog);
        if (minsToLog > 0) {
          toast.success(`Logged ${minsToLog} minutes of progress!`);
        } else {
          toast.success('Timer paused.');
        }
      } else {
        // Starting
        await startTimer(mission.id);
        toast.success(`Timer started for "${mission.name}"!`);
      }
    } catch (err: any) {
      toast.error('Failed to update timer.');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-md">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Type/Day, Title, and Progress */}
        <div className="flex-1 min-w-0">
          {/* Type and Day */}
          <div className="flex items-center gap-3">
            <Text 
              size="xs" 
              weight="bold" 
              className={`uppercase tracking-wide ${accentColorClass}`}
            >
              {getCommitmentTypeLabel(mission.commitmentType)}
            </Text>
            {mission.currentDays !== undefined && (
              <>
                <span className="text-gray-300">•</span>
                <Text size="xs" weight="semibold" className="uppercase text-gray-400 tracking-wide">
                  {mission.commitmentType === 'challenge' && mission.duration
                    ? `DAY ${mission.currentDays} OF ${mission.duration}`
                    : `DAY ${mission.currentDays}`}
                </Text>
              </>
            )}
          </div>

          {/* Title */}
          <div className="mb-3">
            <Text size="xl" weight="bold" className="text-gray-700">
              {mission.name}
            </Text>
          </div>

          {/* Progress Bar with inline label */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar 
                current={currentMinutes} 
                target={mission.targetMinutes}
                variant={progressBarVariant}
              />
            </div>
            {isRunning ? (
              <Text size="sm" weight="semibold" className="text-emerald-500 whitespace-nowrap flex items-center gap-1">
                <span className="font-bold">
                  {currentMinutes}m {String(elapsedSeconds % 60).padStart(2, '0')}s
                </span>
                <span className="text-gray-400">/{mission.targetMinutes}m</span>
              </Text>
            ) : (
              <Text size="sm" weight="semibold" className="text-gray-700 whitespace-nowrap">
                <span className="font-bold">{currentMinutes}</span>
                <span className="text-gray-400">/{mission.targetMinutes} min</span>
              </Text>
            )}
          </div>
        </div>

        {/* Right: Toggle Start/Pause Button */}
        <div className="flex items-center gap-2 flex-shrink-0 self-center">
          <Button 
            variant="primary" 
            onClick={handleToggleTimer} 
            className={`!p-4 !w-14 !h-14 transition-all duration-300 ${
              isRunning 
                ? 'bg-amber-500 hover:bg-amber-600 border-amber-500' 
                : ''
            }`}
          >
            {isRunning ? (
              <PauseIcon className="w-6 h-6 text-white" />
            ) : (
              <PlayIcon className="w-6 h-6 text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
