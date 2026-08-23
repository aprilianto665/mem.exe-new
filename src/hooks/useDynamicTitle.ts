import { useEffect } from 'react';
import { useMissionStore } from '../store/missionStore';

const DEFAULT_TITLE = 'mem.exe - Run your discipline';

export const useDynamicTitle = () => {
  const missions = useMissionStore((state) => state.missions);

  useEffect(() => {
    // Find the mission with an active timer
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

    const updateTitle = () => {
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

    updateTitle();
    const interval = setInterval(updateTitle, 1000);

    return () => {
      clearInterval(interval);
      document.title = DEFAULT_TITLE;
    };
  }, [missions]);
};
