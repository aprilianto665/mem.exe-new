import type { BottomNavigationProps } from '../../types/bottomNavigation.types';
import { NavItem } from '../atoms/NavItem';
import {
  CalendarDaysIcon as CalendarDaysIconOutline,
  CheckCircleIcon as CheckCircleIconOutline,
  PlusIcon,
  ClipboardDocumentCheckIcon as ClipboardDocumentCheckIconOutline,
  Cog6ToothIcon as Cog6ToothIconOutline,
} from '@heroicons/react/24/outline';
import {
  CalendarDaysIcon as CalendarDaysIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  ClipboardDocumentCheckIcon as ClipboardDocumentCheckIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
} from '@heroicons/react/24/solid';


export const BottomNavigation = ({
  activeTab = 'missions',
  onTabChange,
}: BottomNavigationProps) => {
  const handleTabClick = (tab: string) => {
    onTabChange?.(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-center z-50">
      <div className="max-w-xl w-full bg-white rounded-t-4xl shadow-lg border-t border-gray-100 relative">
        <div className="flex items-center justify-around px-2 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <NavItem
            icon={
              activeTab === 'missions' ? (
                <CheckCircleIconSolid className="w-6 h-6" />
              ) : (
                <CheckCircleIconOutline className="w-6 h-6" strokeWidth={2} />
              )
            }
            label="Missions"
            isActive={activeTab === 'missions'}
            onClick={() => handleTabClick('missions')}
          />

          <NavItem
            icon={
              activeTab === 'timeline' ? (
                <CalendarDaysIconSolid className="w-6 h-6" />
              ) : (
                <CalendarDaysIconOutline className="w-6 h-6" strokeWidth={2} />
              )
            }
            label="Timeline"
            isActive={activeTab === 'timeline'}
            onClick={() => handleTabClick('timeline')}
          />

          {/* Spacer untuk Create button */}
          <div className="w-14"></div>

          <NavItem
            icon={
              activeTab === 'todo' ? (
                <ClipboardDocumentCheckIconSolid className="w-6 h-6" />
              ) : (
                <ClipboardDocumentCheckIconOutline className="w-6 h-6" strokeWidth={2} />
              )
            }
            label="To-Do"
            isActive={activeTab === 'todo'}
            onClick={() => handleTabClick('todo')}
          />

          <NavItem
            icon={
              activeTab === 'settings' ? (
                <Cog6ToothIconSolid className="w-6 h-6" />
              ) : (
                <Cog6ToothIconOutline className="w-6 h-6" strokeWidth={2} />
              )
            }
            label="Settings"
            isActive={activeTab === 'settings'}
            onClick={() => handleTabClick('settings')}
          />
        </div>

        {/* Create button absolute */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-7">
          <NavItem
            icon={<PlusIcon className="w-8 h-8" strokeWidth={3} />}
            label="Create"
            variant="create"
            onClick={() => handleTabClick('create')}
          />
        </div>
      </div>
    </nav>
  );
};

