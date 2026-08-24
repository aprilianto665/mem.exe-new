import { useEffect } from 'react';
import { useMissionStore } from '../store/missionStore';
import { usePomodoroStore } from '../store/pomodoroStore';

const DEFAULT_TITLE = 'mem.exe - Run your discipline';

export const useDynamicTitle = () => {
  const missions = useMissionStore((state) => state.missions);
  const pomodoroSession = usePomodoroStore((state) => state.session);
  const serverTimeOffset = usePomodoroStore((state) => state.serverTimeOffset);

  useEffect(() => {
    // 1. Check Pomodoro Session first
    if (pomodoroSession) {
      const pad = (num: number) => String(num).padStart(2, '0');

      const updatePomodoroTitle = () => {
        const targetEndMs = new Date(pomodoroSession.expectedEndTime).getTime();
        const nowWithOffsetMs = Date.now() + (serverTimeOffset || 0);
        const diffMs = targetEndMs - nowWithOffsetMs;
        const diffSecs = Math.max(0, Math.ceil(diffMs / 1000));

        const minutes = Math.floor(diffSecs / 60);
        const seconds = diffSecs % 60;
        const formattedTime = `${pad(minutes)}:${pad(seconds)}`;

        const phaseLabel = pomodoroSession.phase === 'focus' ? 'Focus' : 'Rest';
        document.title = `(${formattedTime}) ${phaseLabel} - ${DEFAULT_TITLE}`;
      };

      updatePomodoroTitle();
      const interval = setInterval(updatePomodoroTitle, 1000);

      return () => {
        clearInterval(interval);
        document.title = DEFAULT_TITLE;
      };
    }

    // 2. Fallback to Default Timer (Active mission with timerStartedAt)
    const activeMission = missions.find((m) => !!m.timerStartedAt);

    if (!activeMission || !activeMission.timerStartedAt) {
      if (document.title !== DEFAULT_TITLE) {
        document.title = DEFAULT_TITLE;
      }
      return;
    }

    const startMs = new Date(activeMission.timerStartedAt).getTime();
    const baseSeconds =
      activeMission.loggedSeconds !== undefined
        ? activeMission.loggedSeconds
        : (activeMission.loggedMinutes || 0) * 60;

    const updateDefaultTitle = () => {
      const elapsedSecs = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      const totalSecs = baseSeconds + elapsedSecs;

      const hours = Math.floor(totalSecs / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;

      const pad = (num: number) => String(num).padStart(2, '0');

      const formattedTime =
        hours > 0
          ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
          : `${pad(minutes)}:${pad(seconds)}`;

      document.title = `(${formattedTime}) ${DEFAULT_TITLE}`;
    };

    updateDefaultTitle();
    const interval = setInterval(updateDefaultTitle, 1000);

    return () => {
      clearInterval(interval);
      document.title = DEFAULT_TITLE;
    };
  }, [missions, pomodoroSession, serverTimeOffset]);
};
