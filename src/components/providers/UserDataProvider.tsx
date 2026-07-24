import type { ReactNode } from 'react';
import { useUserData } from '../../hooks/useUserData';

interface UserDataProviderProps {
  children: ReactNode;
}

export const UserDataProvider = ({ children }: UserDataProviderProps) => {
  useUserData();

  // Render children immediately - loading states are handled by individual components
  // that consume the stores
  return <>{children}</>;
};

