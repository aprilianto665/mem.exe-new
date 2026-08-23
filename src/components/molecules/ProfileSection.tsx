import { Text } from '../atoms/Text';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useUserStore } from '../../store/userStore';

export const ProfileSection = () => {
  const { user, isLoading } = useUserStore();

  const displayName = user?.full_name || 'Loading...';
  const username = user?.username ? `@${user.username}` : '';

  return (
    <div className="bg-white rounded-4xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-4 relative overflow-hidden">
      
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-full bg-[#7DB8E0] flex items-center justify-center overflow-hidden p-2">
            <img 
              src="/mem_icon.png" 
              alt="Profile" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <Text size="xl" weight="bold" className="text-gray-800 truncate">
            {isLoading ? 'Loading...' : displayName}
          </Text>
          {username && (
            <Text size="sm" className="text-gray-500 truncate">
              {username}
            </Text>
          )}
        </div>
      </div>

      <Link 
        href="/settings/profile"
        className="relative p-2 text-gray-400 hover:text-[#7DB8E0] transition-colors cursor-pointer"
        title="My Account"
      >
        <PencilSquareIcon strokeWidth={2} className="w-7 h-7" />
      </Link>
    </div>
  );
};
