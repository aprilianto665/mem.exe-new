"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserDataProvider } from '../components/providers/UserDataProvider';

import { Loading } from '@/components/atoms/Loading';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated' || (status !== 'loading' && !session)) {
      router.replace('/login');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <Loading message="Loading your system..." />;
  }

  if (status === 'unauthenticated' || !session) {
    return null;
  }

  return (
    <UserDataProvider>
      {children}
    </UserDataProvider>
  );
};
