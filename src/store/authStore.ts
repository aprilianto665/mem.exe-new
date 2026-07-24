import { create } from 'zustand';

export interface AuthStoreState {
  emailForVerification: string | null;
  setEmailForVerification: (email: string | null) => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  emailForVerification: null,
  setEmailForVerification: (email) => set({ emailForVerification: email }),
}));


