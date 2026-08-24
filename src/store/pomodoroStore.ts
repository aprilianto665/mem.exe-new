import { create } from 'zustand';
import {
  getPomodoroStatus,
  startPomodoro,
  executeTimerAction,
  type PomodoroSessionData,
} from '../services/pomodoroService';
import { useMissionStore } from './missionStore';
import { soundManager } from '../utils/sound';

export interface PomodoroStoreState {
  session: PomodoroSessionData | null;
  isLoading: boolean;
  error: string | null;
  serverTimeOffset: number; // difference in ms (server - client)
  hasFetched: boolean;

  fetchStatus: () => Promise<void>;
  start: (missionId: string) => Promise<void>;
  stopEarly: () => Promise<void>;
  finishPhase: () => Promise<void>;
  skipRest: () => Promise<void>;
  setSession: (session: PomodoroSessionData | null) => void;
}

let pollIntervalId: any = null;

export const usePomodoroStore = create<PomodoroStoreState>((set, get) => ({
  session: null,
  isLoading: false,
  error: null,
  serverTimeOffset: 0,
  hasFetched: false,

  setSession: (session) => set({ session }),

  fetchStatus: async () => {
    try {
      const data = await getPomodoroStatus();
      if (data) {
        const serverNowMs = new Date(data.serverNow).getTime();
        const clientNowMs = Date.now();
        const offset = serverNowMs - clientNowMs;
        set({ session: data, serverTimeOffset: offset, hasFetched: true, error: null });
      } else {
        set({ session: null, hasFetched: true, error: null });
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch timer status', hasFetched: true });
    }
  },

  start: async (missionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const newSession = await startPomodoro(missionId);
      const serverNowMs = new Date(newSession.serverNow).getTime();
      const offset = serverNowMs - Date.now();
      set({ session: newSession, serverTimeOffset: offset, isLoading: false });
      
      // Also refresh daily missions state
      useMissionStore.getState().fetchDailyMissions();
    } catch (err: any) {
      set({ error: err.message || 'Failed to start timer', isLoading: false });
      throw err;
    }
  },

  stopEarly: async () => {
    const prevSession = get().session;
    // Optimistic clear
    set({ session: null, isLoading: true });
    try {
      await executeTimerAction({ action: 'stop_early' });
      set({ session: null, isLoading: false });
      useMissionStore.getState().fetchDailyMissions();
    } catch (err: any) {
      set({ session: prevSession, error: err.message || 'Failed to stop timer', isLoading: false });
      useMissionStore.getState().fetchDailyMissions();
      throw err;
    }
  },

  finishPhase: async () => {
    const currentSession = get().session;
    if (!currentSession) return;

    if (currentSession.phase === 'focus') {
      soundManager.playFocusComplete();
    } else {
      soundManager.playRestComplete();
    }

    set({ isLoading: true });
    try {
      const updatedSession = await executeTimerAction({ action: 'finish_phase' });
      if (updatedSession) {
        const offset = new Date(updatedSession.serverNow).getTime() - Date.now();
        set({ session: updatedSession, serverTimeOffset: offset, isLoading: false });
      } else {
        set({ session: null, isLoading: false });
      }
      useMissionStore.getState().fetchDailyMissions();
    } catch (err: any) {
      set({ error: err.message || 'Failed to update timer phase', isLoading: false });
      useMissionStore.getState().fetchDailyMissions();
      throw err;
    }
  },

  skipRest: async () => {
    set({ isLoading: true });
    try {
      const updatedSession = await executeTimerAction({ action: 'skip_rest' });
      if (updatedSession) {
        const offset = new Date(updatedSession.serverNow).getTime() - Date.now();
        set({ session: updatedSession, serverTimeOffset: offset, isLoading: false });
      } else {
        set({ session: null, isLoading: false });
      }
      useMissionStore.getState().fetchDailyMissions();
    } catch (err: any) {
      set({ error: err.message || 'Failed to skip rest', isLoading: false });
      useMissionStore.getState().fetchDailyMissions();
      throw err;
    }
  },
}));

// Setup automatic cross-device polling if running in browser
if (typeof window !== 'undefined') {
  if (!pollIntervalId) {
    pollIntervalId = setInterval(() => {
      // Poll every 5s to keep sync across devices
      usePomodoroStore.getState().fetchStatus();
    }, 5000);
  }
}
