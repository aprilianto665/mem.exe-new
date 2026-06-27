import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from 'next-auth/react';
import { UserDataProvider } from '../components/providers/UserDataProvider';

export const ProtectedRoute = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading session...</div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <UserDataProvider>
      <Outlet />
    </UserDataProvider>
  );
};
