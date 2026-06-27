import { create } from 'zustand';
import type { UserSettings } from '../services/settingsService';

export interface SettingsStoreState {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  hasFetched: boolean;
  setSettings: (settings: UserSettings | null) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearSettings: () => void;
  setLastFetched: (timestamp: number | null) => void;
  setHasFetched: (hasFetched: boolean) => void;
}

export const useSettingsStore = create<SettingsStoreState>((set) => ({
  settings: null,
  isLoading: false,
  error: null,
  lastFetched: null,
  hasFetched: false,
  setSettings: (settings) =>
    set({ settings, error: null, lastFetched: Date.now(), hasFetched: true }),
  updateSettings: (partialSettings) =>
    set((state) => ({
      settings: state.settings
        ? { ...state.settings, ...partialSettings }
        : null,
      error: null,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clearSettings: () =>
    set({
      settings: null,
      error: null,
      isLoading: false,
      lastFetched: null,
      hasFetched: false,
    }),
  setLastFetched: (lastFetched) => set({ lastFetched }),
  setHasFetched: (hasFetched) => set({ hasFetched }),
}));

