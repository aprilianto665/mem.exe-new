"use client";

import type { PageTemplateProps } from '../../types/pageTemplate.types';
import { Logo } from '../atoms/Logo';
import { BottomNavigation } from '../molecules/BottomNavigation';
import { useRouter, usePathname } from 'next/navigation';
import { useMemo } from 'react';

export const PageTemplate = ({ children }: PageTemplateProps) => {
  const router = useRouter();
  const pathname = usePathname();

  // Map routes to tab names
  const routeToTabMap: Record<string, string> = useMemo(
    () => ({
      '/missions': 'missions',
      '/timeline': 'timeline',
      '/todo': 'todo',
      '/settings': 'settings',
      '/create': 'create',
    }),
    []
  );

  // Get active tab from current route
  const activeTab = useMemo(() => {
    // First check for exact match
    if (pathname && routeToTabMap[pathname]) {
      return routeToTabMap[pathname];
    }
    
    // Check for nested routes by matching pathname prefix
    // This handles routes like /settings/manage, /settings/profile, etc.
    if (pathname) {
      for (const [route, tab] of Object.entries(routeToTabMap)) {
        if (pathname.startsWith(route + '/') || pathname === route) {
          return tab;
        }
      }
    }
    
    return 'missions';
  }, [pathname, routeToTabMap]);

  // Map tab names to routes
  const tabToRouteMap: Record<string, string> = {
    missions: '/missions',
    timeline: '/timeline',
    todo: '/todo',
    settings: '/settings',
    create: '/create',
  };

  const handleTabChange = (tab: string) => {
    const route = tabToRouteMap[tab];
    if (route) {
      router.push(route);
    }
  };

  return (
    <>
      <div className="min-h-screen app-background px-4">
        <div className="max-w-xl mx-auto">
          <Logo src="/mem_logo.png" alt="Mem Logo" />
          {children}
        </div>
      </div>
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  );
};

