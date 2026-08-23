"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageTemplate } from '../../components/templates/PageTemplate';
import { Text } from '../../components/atoms/Text';
import { Input } from '../../components/atoms/Input';
import { ArrowLeftIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline';
import { updateUserSettings, SettingsError } from '../../services/settingsService';
import { markTimezoneAsManual } from '../../hooks/useUserData';
import { useSettingsStore } from '../../store/settingsStore';
import { useUserStore } from '../../store/userStore';
import toast from 'react-hot-toast';

type IntlWithTimeZones = typeof Intl & {
  supportedValuesOf?: (key: string) => string[];
};

const getTimeZones = (): string[] => {
  const intlWithTimeZones = Intl as IntlWithTimeZones;
  const supported = intlWithTimeZones.supportedValuesOf?.('timeZone');

  if (Array.isArray(supported) && supported.length > 0) {
    return supported;
  }

  return [
    'UTC',
    'Europe/London',
    'Europe/Berlin',
    'Asia/Jakarta',
    'Asia/Singapore',
    'Asia/Tokyo',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
  ];
};

export const Timezone = () => {
  const router = useRouter();
  const timeZones = useMemo(() => getTimeZones(), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { settings, setSettings } = useSettingsStore();
  const user = useUserStore((state) => state.user);

  const filteredTimeZones = useMemo(
    () =>
      timeZones.filter((zone) =>
        zone.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      ),
    [timeZones, searchQuery],
  );

  const handleSelect = async (timezone: string) => {
    // Don't update if it's the same timezone
    if (settings?.timezone === timezone) {
      router.push('/settings');
      return;
    }

    setIsUpdating(true);
    try {
      const updatedSettings = await updateUserSettings({ timezone });
      markTimezoneAsManual(user?.id ?? '');
      // Update store directly from response, no need to fetch again
      setSettings(updatedSettings);
      toast.success('Timezone updated successfully');
      router.push('/settings');
    } catch (error) {
      if (error instanceof SettingsError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update timezone');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <PageTemplate>
      <div
        className="flex flex-col"
        style={{ height: 'calc(100vh - 200px)' }}
      >
        <div className="flex-shrink-0 mb-6 relative flex items-center justify-center">
          <button
            onClick={() => router.push('/settings')}
            className="absolute left-0 flex items-center gap-1.5 text-gray-600 hover:text-gray-800 cursor-pointer px-2 py-1 rounded-xl hover:bg-white/50"
          >
            <ArrowLeftIcon strokeWidth={2.5} className="w-5 h-5" />
            <Text size="sm" weight="semibold">
              Settings
            </Text>
          </button>

          <Text size="2xl" weight="bold" className="text-gray-800">
            Timezone
          </Text>
        </div>

        <div className="flex-shrink-0 mb-3 px-1 flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600">
              <MagnifyingGlassIcon strokeWidth={2} className="h-5 w-5" />
            </div>
            <Input
              placeholder="Search timezone..."
              className="pl-11 !bg-[#E5E7EB] !placeholder-gray-600"
              variant="noBorder"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-shrink-0 mb-4 px-1">
          <Text size="xs" className="text-gray-400">
            Timezone list uses IANA identifiers (e.g. Asia/Jakarta, America/New_York).
          </Text>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
          <div className="space-y-3">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {filteredTimeZones.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <Text size="sm" className="text-gray-400">
                    No timezones found
                  </Text>
                </div>
              ) : (
                filteredTimeZones.map((zone) => (
                  <button
                    key={zone}
                    type="button"
                    onClick={() => handleSelect(zone)}
                    disabled={isUpdating}
                    className="w-full text-left px-5 py-3 flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50 cursor-pointer border-b last:border-b-0 border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Text size="sm" weight="semibold" className="text-gray-700">
                      {zone}
                    </Text>
                    {settings?.timezone === zone && (
                      <CheckIcon className="w-5 h-5 text-[#7DB8E0]" strokeWidth={2.5} />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};


