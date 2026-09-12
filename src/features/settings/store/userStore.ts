import { create } from 'zustand';
import type { UserProfile } from '../services/userService';

export interface UserStoreState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
  setHasFetched: (hasFetched: boolean) => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  hasFetched: false,
  setUser: (user) => set({ user, error: null, hasFetched: true }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clearUser: () => set({ user: null, error: null, isLoading: false, hasFetched: false }),
  setHasFetched: (hasFetched) => set({ hasFetched }),
}));

