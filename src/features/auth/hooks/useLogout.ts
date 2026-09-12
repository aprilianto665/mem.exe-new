import toast from 'react-hot-toast';
import { signOut } from 'next-auth/react';
import { useUserStore } from '@/features/settings/store/userStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';

interface UseLogoutReturn {
  handleLogout: () => void;
}

export const useLogout = (): UseLogoutReturn => {
  const clearUser = useUserStore((state) => state.clearUser);
  const clearSettings = useSettingsStore((state) => state.clearSettings);

  const handleLogout = async () => {
    clearUser();
    clearSettings();
    toast.success('Logged out successfully');
    await signOut({ callbackUrl: '/login' });
  };

  return {
    handleLogout,
  };
};
