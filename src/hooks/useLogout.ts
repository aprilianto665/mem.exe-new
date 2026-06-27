import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signOut } from 'next-auth/react';
import { useUserStore } from '../store/userStore';
import { useSettingsStore } from '../store/settingsStore';

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
