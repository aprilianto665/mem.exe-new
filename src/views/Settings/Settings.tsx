"use client";

import { PageTemplate } from '../../components/templates/PageTemplate';
import { Text } from '../../components/atoms/Text';
import { AboutSection } from '../../components/molecules/AboutSection';
import { Button } from '../../components/atoms/Button';
import { ProfileSection } from '../../components/molecules/ProfileSection';
import {
  ArrowRightOnRectangleIcon,
  Square3Stack3DIcon,
  ChevronRightIcon,
  ClockIcon,
  SparklesIcon,
  CheckIcon,
  GlobeAltIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Switch } from '../../components/atoms/Switch';
import { Input } from '../../components/atoms/Input';
import { useLogout } from '../../hooks/useLogout';
import { useSettingsStore } from '../../store/settingsStore';
import { usePomodoroStore } from '../../store/pomodoroStore';
import { useMissionStore } from '../../store/missionStore';
import { updateUserSettings, SettingsError } from '../../services/settingsService';
import toast from 'react-hot-toast';

export const Settings = () => {
  const { handleLogout } = useLogout();
  const { settings, setSettings } = useSettingsStore();
  const { missions, fetchDailyMissions } = useMissionStore();
  const { session: pomodoroSession, fetchStatus: fetchPomodoroStatus } = usePomodoroStore();
  const [activeMode, setActiveMode] = useState<'default' | 'pomodoro'>('default');
  const [pomodoroConfig, setPomodoroConfig] = useState({
    focus: '25',
    shortRest: '5'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPomodoroStatus();
    fetchDailyMissions();
  }, [fetchPomodoroStatus, fetchDailyMissions]);

  // Initialize state from store
  useEffect(() => {
    if (settings) {
      setActiveMode(settings.execution_mode);
      setPomodoroConfig({
        focus: String(settings.pomodoro.focus_minutes),
        shortRest: String(settings.pomodoro.rest_minutes),
      });
    }
  }, [settings]);

  const activeDefaultTimerMission = missions.find((m) => !!m.timerStartedAt);
  const isTimerActive = !!pomodoroSession || !!activeDefaultTimerMission;

  const handlePomodoroChange = (key: keyof typeof pomodoroConfig, value: string) => {
    if (value === '' || /^\d*$/.test(value)) {
      setPomodoroConfig(prev => ({ ...prev, [key]: value }));
    }
  };

  // Validate pomodoro config
  const isPomodoroConfigValid = () => {
    const focus = parseInt(pomodoroConfig.focus);
    const rest = parseInt(pomodoroConfig.shortRest);
    return (
      !isNaN(focus) &&
      !isNaN(rest) &&
      focus > 0 &&
      rest > 0 &&
      pomodoroConfig.focus !== '' &&
      pomodoroConfig.shortRest !== ''
    );
  };

  const handleExecutionModeChange = async (mode: 'default' | 'pomodoro') => {
    if (isTimerActive) {
      toast.error('Please complete or stop your active timer first');
      return;
    }

    if (activeMode === mode) {
      return;
    }

    try {
      const updatedSettings = await updateUserSettings({ execution_mode: mode });
      setSettings(updatedSettings);
      setActiveMode(mode);
      toast.success('Execution mode updated successfully');
    } catch (error) {
      if (error instanceof SettingsError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update execution mode');
      }
    }
  };

  const handleSaveSettings = async () => {
    if (!isPomodoroConfigValid()) {
      toast.error('Please enter valid values for focus and rest minutes');
      return;
    }

    setIsSaving(true);
    try {
      const updatedSettings = await updateUserSettings({
        execution_mode: activeMode,
        pomodoro: {
          focus_minutes: parseInt(pomodoroConfig.focus),
          rest_minutes: parseInt(pomodoroConfig.shortRest),
        },
      });
      setSettings(updatedSettings);
      toast.success('Settings saved successfully');
    } catch (error) {
      if (error instanceof SettingsError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to save settings');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageTemplate>
      <div className="mb-6">
        <Text size="2xl" weight="bold" className="text-gray-700 mb-1 text-center">
          Settings
        </Text>
      </div>

      <div className="pb-32">
        <div className="mb-8">
          <ProfileSection />
        </div>

        <div className="mb-6">
          <div className="mb-2 px-1">
            <Text size="sm" weight="bold" className="text-gray-400 uppercase tracking-wider">
              Missions
            </Text>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <Link 
              href="/settings/manage"
              className="p-4 flex items-center justify-between group active:bg-gray-50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="text-[#7DB8E0]">
                  <Square3Stack3DIcon className="w-6 h-6" />
                </div>
                <Text size="base" weight="semibold" className="text-gray-700">Manage Mission</Text>
              </div>
              <ChevronRightIcon strokeWidth={2} className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-2 px-1">
            <Text size="sm" weight="bold" className="text-gray-400 uppercase tracking-wider">
              Time
            </Text>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <Link
              href="/settings/timezone"
              className="p-4 flex items-center justify-between group active:bg-gray-50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="text-[#7DB8E0]">
                  <GlobeAltIcon className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <Text size="base" weight="semibold" className="text-gray-700">
                    Timezone
                  </Text>
                  {settings?.timezone && (
                    <Text size="sm" className="text-gray-500">
                      {settings.timezone}
                    </Text>
                  )}
                </div>
              </div>
              <ChevronRightIcon strokeWidth={2} className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-2 px-1">
            <Text size="sm" weight="bold" className="text-gray-400 uppercase tracking-wider">
              Execution Mode
            </Text>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div 
              className={`p-4 flex items-center justify-between transition-colors ${
                isTimerActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50/50'
              }`}
              onClick={() => !isTimerActive && handleExecutionModeChange('default')}
            >
              <div className="flex items-center gap-4">
                <div className="text-[#7DB8E0]">
                  <ClockIcon className="w-6 h-6" />
                </div>
                <Text size="base" weight="semibold" className="text-gray-700">Default Timer</Text>
              </div>
              <Switch 
                checked={activeMode === 'default'} 
                onChange={() => handleExecutionModeChange('default')} 
                disabled={isTimerActive}
              />
            </div>

            <div className="border-t border-gray-50 mx-4" />

            <div 
              className={`p-4 flex items-center justify-between transition-colors ${
                isTimerActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50/50'
              }`}
              onClick={() => !isTimerActive && handleExecutionModeChange('pomodoro')}
            >
              <div className="flex items-center gap-4">
                <div className="text-[#7DB8E0]">
                  <SparklesIcon className="w-6 h-6" />
                </div>
                <Text size="base" weight="semibold" className="text-gray-700">Pomodoro Technique</Text>
              </div>
              <Switch 
                checked={activeMode === 'pomodoro'} 
                onChange={() => handleExecutionModeChange('pomodoro')} 
                disabled={isTimerActive}
              />
            </div>

            <div
              className="overflow-hidden"
              style={{
                maxHeight: activeMode === 'pomodoro' ? '300px' : '0',
                opacity: activeMode === 'pomodoro' ? 1 : 0,
                transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out',
              }}
            >
              <div className="px-4 pb-4 pt-2">
                <div className="flex gap-3 items-end">
                  <div className="relative flex-1 group">
                    <Input 
                      label="Focus"
                      type="text"
                      inputMode="numeric"
                      variant="noBorder"
                      value={pomodoroConfig.focus}
                      onChange={(e) => handlePomodoroChange('focus', e.target.value)}
                      className="!py-2 !pl-3 !pr-9 !rounded-xl text-center font-medium"
                      disabled={isTimerActive || isSaving}
                    />
                    <span className="absolute right-3 bottom-[11px] text-[10px] text-gray-400 pointer-events-none">min</span>
                  </div>
                  
                  <div className="relative flex-1 group">
                    <Input 
                      label="Rest"
                      type="text"
                      inputMode="numeric"
                      variant="noBorder"
                      value={pomodoroConfig.shortRest}
                      onChange={(e) => handlePomodoroChange('shortRest', e.target.value)}
                      className="!py-2 !pl-3 !pr-9 !rounded-xl text-center font-medium"
                      disabled={isTimerActive || isSaving}
                    />
                    <span className="absolute right-3 bottom-[11px] text-[10px] text-gray-400 pointer-events-none">min</span>
                  </div>
                </div>

                <div className="mt-4">
                  <Button 
                    className="w-full !py-2 !rounded-xl !text-sm"
                    onClick={handleSaveSettings}
                    disabled={isTimerActive || isSaving || !isPomodoroConfigValid()}
                  >
                    <CheckIcon strokeWidth={2} className="w-4 h-4" />
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="mb-6">
          <div className="mb-2 px-1">
            <Text size="sm" weight="bold" className="text-gray-400 uppercase tracking-wider">
              App
            </Text>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <Link
              href="/settings/api-key"
              className="p-4 flex items-center justify-between group active:bg-gray-50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="text-[#7DB8E0]">
                  <KeyIcon className="w-6 h-6" />
                </div>
                <Text size="base" weight="semibold" className="text-gray-700">
                  Public API Key & Widget
                </Text>
              </div>
              <ChevronRightIcon strokeWidth={2} className="w-5 h-5 text-gray-400" />
            </Link>

            <div className="border-t border-gray-50 mx-4" />

            <AboutSection noCard={true} />
          </div>
        </div>

        <div className="mt-8">
          <Button
            onClick={handleLogout}
            className="w-full !bg-[#FF6467] !text-white hover:!bg-[#E5555A]"
          >
            <ArrowRightOnRectangleIcon strokeWidth={2} className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </div>
    </PageTemplate>
  );
};
