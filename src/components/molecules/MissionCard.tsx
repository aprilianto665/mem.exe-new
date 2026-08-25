import { useState, useEffect } from 'react';
import { PlayIcon, PauseIcon, StopIcon, ForwardIcon } from '@heroicons/react/24/solid';
import type { MissionCardProps } from '../../types/missionCard.types';
import { Text } from '../atoms/Text';
import { ProgressBar } from '../atoms/ProgressBar';
import { Button } from '../atoms/Button';
import { useMissionStore } from '../../store/missionStore';
import { useSettingsStore } from '../../store/settingsStore';
import { usePomodoroStore } from '../../store/pomodoroStore';
import toast from 'react-hot-toast';

// Helper function to get commitment type label
const getCommitmentTypeLabel = (type: string): string => {
  return type === 'daily-habit' ? 'DAILY HABIT' : 'CHALLENGE';
};

export const MissionCard = ({ 
  mission 
}: MissionCardProps) => {
  const { startTimer, pauseTimer, fetchDailyMissions } = useMissionStore();
  const { settings, hasFetched: settingsHasFetched, isLoading: isSettingsLoading } = useSettingsStore();
  const { 
    session: pomodoroSession, 
    serverTimeOffset, 
    start: startPomodoro, 
    stopEarly: stopPomodoro, 
    finishPhase: finishPomodoroPhase, 
    skipRest: skipPomodoroRest,
    isLoading: isPomodoroLoading,
    fetchStatus: fetchPomodoroStatus
  } = usePomodoroStore();

  const isPomodoroMode = settings?.execution_mode === 'pomodoro';
  const isThisPomodoroActive = isPomodoroMode && pomodoroSession?.missionId === mission.id;
  const isAnotherPomodoroActive = isPomodoroMode && !!pomodoroSession && pomodoroSession.missionId !== mission.id;

  // Default mode state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const isRunningDefault = !!mission.timerStartedAt;

  // Pomodoro countdown remaining state (in seconds)
  const [pomodoroRemainingSecs, setPomodoroRemainingSecs] = useState<number>(0);

  // 1. Logic for Default Mode Timer
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
        toast.error('Timer stopped automatically due to day rollover');
        try {
          await pauseTimer(mission.id, 0);
        } catch {
          // ignore error
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

  // 2. Logic for Pomodoro Countdown Timer
  useEffect(() => {
    if (!isThisPomodoroActive || !pomodoroSession) {
      return;
    }

    const updateCountdown = async () => {
      const startMs = new Date(pomodoroSession.startTime).getTime();
      const startDate = new Date(startMs);
      const now = new Date();

      const isDifferentDay =
        startDate.getDate() !== now.getDate() ||
        startDate.getMonth() !== now.getMonth() ||
        startDate.getFullYear() !== now.getFullYear();

      if (isDifferentDay) {
        toast.error('Timer stopped automatically due to day rollover');
        try {
          await fetchPomodoroStatus();
          await fetchDailyMissions();
        } catch {
          // ignore
        }
        return;
      }

      const targetEndMs = new Date(pomodoroSession.expectedEndTime).getTime();
      const nowWithOffsetMs = Date.now() + (serverTimeOffset || 0);
      const diffMs = targetEndMs - nowWithOffsetMs;
      const diffSecs = Math.max(0, Math.ceil(diffMs / 1000));

      setPomodoroRemainingSecs(diffSecs);

      if (diffSecs <= 0) {
        if (isPomodoroLoading) return;
        // Automatically finish phase when time hits zero
        try {
          await finishPomodoroPhase();
        } catch {
          // handled by store
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isThisPomodoroActive, pomodoroSession, serverTimeOffset, finishPomodoroPhase, fetchPomodoroStatus, fetchDailyMissions, isPomodoroLoading]);

  const baseSeconds = mission.loggedSeconds !== undefined
    ? mission.loggedSeconds
    : (mission.loggedMinutes || 0) * 60;

  const totalSeconds = isRunningDefault ? baseSeconds + elapsedSeconds : baseSeconds;
  const currentMinutes = Math.floor(totalSeconds / 60);
  const currentSecs = totalSeconds % 60;

  const isChallenge = mission.commitmentType === 'challenge';
  const accentColorClass = isChallenge ? 'text-purple-400' : 'text-[#7DB8E0]';
  const progressBarVariant = isChallenge ? 'purple' : 'blue';

  // Handlers for default timer
  const handleToggleDefaultTimer = async () => {
    // If settings indicate pomodoro mode and timer is not running, redirect to start Pomodoro
    const currentSettings = useSettingsStore.getState().settings;
    if (currentSettings?.execution_mode === 'pomodoro' && !isRunningDefault) {
      await handleStartPomodoro();
      return;
    }

    try {
      if (isRunningDefault) {
        await pauseTimer(mission.id, elapsedSeconds);
        if (elapsedSeconds >= 60) {
          const minsToLog = Math.floor(elapsedSeconds / 60);
          toast.success(`Logged ${minsToLog} minute${minsToLog > 1 ? 's' : ''} of progress!`);
        } else {
          toast.success('Timer paused.');
        }
      } else {
        await startTimer(mission.id);
        toast.success(`Timer started for "${mission.name}"!`);
      }
    } catch {
      toast.error('Failed to update timer.');
    }
  };

  // Handlers for Pomodoro timer
  const handleStartPomodoro = async () => {
    if (isAnotherPomodoroActive) {
      toast.error('Please complete or stop the active Pomodoro session first');
      return;
    }

    try {
      await startPomodoro(mission.id);
      toast.success(`Pomodoro started for "${mission.name}"!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to start Pomodoro');
    }
  };

  const handleStopPomodoro = async () => {
    try {
      await stopPomodoro();
      toast.success('Focus session stopped. Progress saved!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to stop Pomodoro');
    }
  };

  const handleSkipRest = async () => {
    try {
      await skipPomodoroRest();
      toast.success('Rest session skipped.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to skip rest');
    }
  };

  // Formatting Pomodoro MM:SS
  const pomoMinutes = Math.floor(pomodoroRemainingSecs / 60);
  const pomoSeconds = pomodoroRemainingSecs % 60;
  const formattedPomoTime = `${String(pomoMinutes).padStart(2, '0')}:${String(pomoSeconds).padStart(2, '0')}`;

  const isCompleted = currentMinutes >= mission.targetMinutes;

  return (
    <div 
      className="bg-white rounded-3xl p-6 border border-gray-200 shadow-md transition-all duration-300"
    >
      {/* Top Header / Collapsed Summary Row */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Type/Day, Title, and Progress */}
        <div className="flex-1 min-w-0">
          {/* Type and Day */}
          <div className={`flex items-center gap-3 ${isThisPomodoroActive ? 'justify-center' : ''}`}>
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
          <div className={`mb-3 ${isThisPomodoroActive ? 'text-center' : ''}`}>
            <Text size="xl" weight="bold" className="text-gray-700">
              {mission.name}
            </Text>
          </div>

          {/* Progress Bar with inner label */}
          <div className="w-full">
            <ProgressBar 
              current={currentMinutes} 
              target={mission.targetMinutes}
              projected={isThisPomodoroActive && pomodoroSession?.phase === 'focus' ? (settings?.pomodoro.focus_minutes || 25) : 0}
              variant={progressBarVariant}
              isRunning={isRunningDefault || isThisPomodoroActive}
            >
              {isRunningDefault ? (
                <div className="text-xs font-bold text-emerald-600 whitespace-nowrap flex items-center gap-0.5">
                  <span>
                    {currentMinutes}m {String(currentSecs).padStart(2, '0')}s
                  </span>
                  <span className="text-gray-500 font-bold">/{mission.targetMinutes}m</span>
                </div>
              ) : (
                <div className="text-xs font-bold text-gray-700 whitespace-nowrap flex items-center gap-0.5">
                  <span>
                    {currentSecs > 0 ? `${currentMinutes}m ${String(currentSecs).padStart(2, '0')}s` : `${currentMinutes}m`}
                  </span>
                  <span className="text-gray-500 font-bold">/{mission.targetMinutes}m</span>
                </div>
              )}
            </ProgressBar>
          </div>
        </div>

        {/* Right: Action Button (when not in expanded Pomodoro mode) */}
        {!isThisPomodoroActive && (
          <div className="flex items-center gap-2 flex-shrink-0 self-center">
            {isPomodoroMode && !isRunningDefault ? (
              <Button 
                variant="primary" 
                onClick={handleStartPomodoro} 
                disabled={isAnotherPomodoroActive || isPomodoroLoading || (!settings && isSettingsLoading)}
                aria-label="Start Pomodoro Focus"
                className={`!p-4 !w-14 !h-14 transition-colors duration-200 ${
                  isAnotherPomodoroActive || (!settings && isSettingsLoading)
                    ? '!bg-gray-200 !text-gray-400 cursor-not-allowed border-none'
                    : ''
                }`}
              >
                <PlayIcon className="w-6 h-6 text-white" />
              </Button>
            ) : (
              <Button 
                variant="primary" 
                onClick={handleToggleDefaultTimer} 
                disabled={!isRunningDefault && !settings && isSettingsLoading}
                className={`!p-4 !w-14 !h-14 transition-colors duration-200 ${
                  isRunningDefault 
                    ? 'bg-amber-500 hover:bg-amber-600 border-amber-500' 
                    : !isRunningDefault && !settings && isSettingsLoading
                    ? '!bg-gray-200 !text-gray-400 cursor-not-allowed border-none'
                    : ''
                }`}
              >
                {isRunningDefault ? (
                  <PauseIcon className="w-6 h-6 text-white" />
                ) : (
                  <PlayIcon className="w-6 h-6 text-white" />
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Expanded Pomodoro Section */}
      {isThisPomodoroActive && pomodoroSession && (
        <div className="mt-6 pt-5 border-t border-gray-100 w-full flex flex-col items-center justify-center animate-fadeIn">
          {/* Phase Header */}
          <div className="mb-1 text-center">
            {pomodoroSession.phase === 'focus' ? (
              <Text size="xs" weight="bold" className="uppercase tracking-widest text-amber-500">
                Focus Mode
              </Text>
            ) : (
              <Text size="xs" weight="bold" className="uppercase tracking-widest text-emerald-500">
                Rest & Recharge
              </Text>
            )}
          </div>

          {/* Large prominent timer countdown display */}
          <div className="my-2">
            <span 
              className="font-mono text-5xl sm:text-6xl font-black tracking-tight tabular-nums text-[#364152]"
            >
              {formattedPomoTime}
            </span>
          </div>

          {/* Controls & Helper Text */}
          <div className="mt-4 w-full flex flex-col items-center gap-2">
            {pomodoroSession.phase === 'focus' ? (
              <>
                <Button
                  variant="primary"
                  onClick={handleStopPomodoro}
                  disabled={isPomodoroLoading}
                  className="w-full !py-3.5 !rounded-2xl !bg-rose-500 hover:!bg-rose-600 border-none transition-colors duration-200 flex items-center justify-center gap-2 font-semibold text-sm shadow-sm text-white"
                >
                  <StopIcon className="w-5 h-5 text-white" />
                  <span>Stop Focus</span>
                </Button>
                <Text size="xs" className="text-[#364152] text-center font-medium mt-1">
                  Stopping early will still save your progress
                </Text>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 w-full">
                  <Button
                    variant="primary"
                    onClick={handleStopPomodoro}
                    disabled={isPomodoroLoading}
                    className="flex-1 !py-3.5 !rounded-2xl !bg-rose-500 hover:!bg-rose-600 border-none transition-colors duration-200 flex items-center justify-center gap-2 font-semibold text-sm shadow-sm text-white"
                  >
                    <StopIcon className="w-5 h-5 text-white" />
                    <span>Stop</span>
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSkipRest}
                    disabled={isPomodoroLoading}
                    className="flex-1 !py-3.5 !rounded-2xl !bg-emerald-500 hover:!bg-emerald-600 border-none transition-colors duration-200 flex items-center justify-center gap-2 font-semibold text-sm shadow-sm text-white"
                  >
                    <ForwardIcon className="w-5 h-5 text-white" />
                    <span>Skip Rest</span>
                  </Button>
                </div>
                <Text size="xs" className="text-[#364152] text-center font-medium mt-1">
                  Rest & Recharge. Next focus starts automatically.
                </Text>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
