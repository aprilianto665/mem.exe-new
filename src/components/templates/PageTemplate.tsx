import type { PageTemplateProps } from '../../types/pageTemplate.types';
import { Logo } from '../atoms/Logo';
import { BottomNavigation } from '../molecules/BottomNavigation';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

export const PageTemplate = ({ children }: PageTemplateProps) => {
  const navigate = useNavigate();
  const location = useLocation();

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
    if (routeToTabMap[location.pathname]) {
      return routeToTabMap[location.pathname];
    }
    
    // Check for nested routes by matching pathname prefix
    // This handles routes like /settings/manage, /settings/profile, etc.
    for (const [route, tab] of Object.entries(routeToTabMap)) {
      if (location.pathname.startsWith(route + '/') || location.pathname === route) {
        return tab;
      }
    }
    
    return 'missions';
  }, [location.pathname, routeToTabMap]);

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
      navigate(route);
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

