"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageTemplate } from '../../components/templates/PageTemplate';
import { Text } from '../../components/atoms/Text';
import { Button } from '../../components/atoms/Button';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useUserStore } from '../../store/userStore';

export const MyAccount = () => {
  const router = useRouter();
  const [isEmailRevealed, setIsEmailRevealed] = useState(false);
  const { user, isLoading } = useUserStore();

  const email = user?.email || '';
  const fullName = user?.full_name || '';
  const username = user?.username || '';
  const memberSince = user?.member_since
    ? new Date(user.member_since).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const maskEmail = (email: string) => {
    const [user, domain] = email.split('@');
    return '*'.repeat(user.length) + '@' + domain;
  };

  return (
    <PageTemplate>
      <div className="flex flex-col h-full pb-32">
        {/* Header */}
        <div className="flex-shrink-0 mb-6 relative flex items-center justify-center">
          <button
            onClick={() => router.push('/settings')}
            className="absolute left-0 flex items-center gap-1.5 text-gray-600 hover:text-gray-800 cursor-pointer px-2 py-1 rounded-xl hover:bg-white/50"
          >
            <ArrowLeftIcon strokeWidth={2.5} className="w-5 h-5" />
            <Text size="sm" weight="semibold">Back</Text>
          </button>
          
          <Text size="2xl" weight="bold" className="text-gray-800">
            My Account
          </Text>
        </div>

        {/* Form Section */}
        <div className="flex-1 space-y-4">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Full Name */}
            <div className="px-6 py-5 border-b border-gray-100 last:border-b-0">
              <Text size="xs" weight="bold" className="text-gray-500 uppercase tracking-wider mb-3">
                Full Name
              </Text>
              <div className="flex items-center justify-between gap-4">
                <Text size="lg" weight="semibold" className="text-gray-800">
                  {isLoading ? 'Loading...' : fullName || 'Not set'}
                </Text>
                <Button 
                  variant="primary" 
                  className="!py-2 !px-5 !text-sm !rounded-xl"
                  onClick={() => router.push('/settings/profile/edit-fullname')}
                >
                  Edit
                </Button>
              </div>
            </div>

            {/* Username */}
            <div className="px-6 py-5 border-b border-gray-100 last:border-b-0">
              <Text size="xs" weight="bold" className="text-gray-500 uppercase tracking-wider mb-3">
                Username
              </Text>
              <div className="flex items-center justify-between gap-4">
                <Text size="lg" weight="semibold" className="text-gray-800">
                  {isLoading ? 'Loading...' : username ? `@${username}` : 'Not set'}
                </Text>
                <Button 
                  variant="primary" 
                  className="!py-2 !px-5 !text-sm !rounded-xl"
                  onClick={() => router.push('/settings/profile/edit-username')}
                >
                  Edit
                </Button>
              </div>
            </div>
            
            {/* Email Address */}
            <div className="px-6 py-5 border-b border-gray-100 last:border-b-0">
              <Text size="xs" weight="bold" className="text-gray-500 uppercase tracking-wider mb-3">
                Email Address
              </Text>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Text size="lg" weight="semibold" className="text-gray-800 truncate">
                    {email ? (isEmailRevealed ? email : maskEmail(email)) : (isLoading ? 'Loading...' : 'Not available')}
                  </Text>
                  <button 
                    onClick={() => setIsEmailRevealed(!isEmailRevealed)}
                    className="flex-shrink-0 text-[#7DB8E0] hover:text-[#6BA8D0] cursor-pointer p-1 rounded-lg hover:bg-gray-50"
                    title={isEmailRevealed ? 'Hide email' : 'Reveal email'}
                  >
                    {isEmailRevealed ? (
                      <EyeSlashIcon className="w-5 h-5" strokeWidth={2} />
                    ) : (
                      <EyeIcon className="w-5 h-5" strokeWidth={2} />
                    )}
                  </button>
                </div>
                <Button 
                  variant="primary" 
                  className="!py-2 !px-5 !text-sm !rounded-xl flex-shrink-0"
                >
                  Edit
                </Button>
              </div>
            </div>

            {/* Password */}
            <div className="px-6 py-5 border-b border-gray-100 last:border-b-0">
              <Text size="xs" weight="bold" className="text-gray-500 uppercase tracking-wider mb-3">
                Password
              </Text>
              <Button 
                variant="primary" 
                className="!py-2.5 !px-6 !text-sm !rounded-xl w-full sm:w-auto"
                onClick={() => router.push('/settings/profile/change-password')}
              >
                Change Password
              </Button>
            </div>

            {/* Member Since */}
            <div className="px-6 py-5 bg-gray-50/50">
              <Text size="xs" weight="bold" className="text-gray-500 uppercase tracking-wider mb-3">
                Member Since
              </Text>
              <Text size="lg" weight="semibold" className="text-gray-700">
                {isLoading ? 'Loading...' : memberSince || 'Not available'}
              </Text>
            </div>
          </div>
        </div>

      </div>
    </PageTemplate>
  );
};
