import { useState, useEffect, useCallback, useRef } from 'react';
import { PageTemplate } from '../../components/templates/PageTemplate';
import { TimelineCalendar } from '../../components/organisms/TimelineCalendar';
import { MissionListTimeline } from '../../components/molecules/MissionListTimeline';
import { Text } from '../../components/atoms/Text';
import { useMissionStore } from '../../store/missionStore';
import { toLocalYYYYMMDD } from '../../data/missionHistory';
import type { DayMissionData } from '../../types/missionHistory.types';

const DailyTimelineSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="flex items-center justify-between mb-6">
      <div className="h-8 w-48 bg-gray-200 rounded-lg" />
      <div className="h-5 w-24 bg-gray-200 rounded-lg" />
    </div>
    <div className="space-y-3">
      <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
      <div className="relative pl-4 space-y-4 text-left">
        {/* Bullet and card 1 */}
        <div className="flex items-start gap-4">
          <div className="mt-3.5 w-3.5 h-3.5 rounded-full bg-gray-200 border-2 border-white shadow-sm flex-shrink-0" />
          <div className="flex-1 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="h-5 w-2/3 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded-full flex-shrink-0" />
            </div>
            <div className="flex gap-4 pt-2">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
        {/* Bullet and card 2 */}
        <div className="flex items-start gap-4">
          <div className="mt-3.5 w-3.5 h-3.5 rounded-full bg-gray-200 border-2 border-white shadow-sm flex-shrink-0" />
          <div className="flex-1 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="h-5 w-1/2 bg-gray-200 rounded" />
                <div className="h-3 w-1/3 bg-gray-200 rounded" />
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded-full flex-shrink-0" />
            </div>
            <div className="flex gap-4 pt-2">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const Timeline = () => {
  const { monthlyTimeline, fetchMonthlyTimeline, fetchDailyTimeline, isLoading, setIsLoading } = useMissionStore();
  const [selectedDayData, setSelectedDayData] = useState<DayMissionData | null>(null);
  const [isDailyLoading, setIsDailyLoading] = useState(false);

  const monthTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dailyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (monthTimeoutRef.current) clearTimeout(monthTimeoutRef.current);
      if (dailyTimeoutRef.current) clearTimeout(dailyTimeoutRef.current);
    };
  }, []);

  // Initialize page on mount
  useEffect(() => {
    const today = new Date();
    fetchMonthlyTimeline(today.getFullYear(), today.getMonth() + 1);
    
    const todayStr = toLocalYYYYMMDD(today);
    setIsDailyLoading(true);
    fetchDailyTimeline(todayStr).then((data) => {
      setSelectedDayData(data);
      setIsDailyLoading(false);
    }).catch((err) => {
      if (err?.name === 'CanceledError' || err?.name === 'AbortError') {
        return;
      }
      setIsDailyLoading(false);
    });
  }, [fetchMonthlyTimeline, fetchDailyTimeline]);

  const handleMonthChange = useCallback((date: Date) => {
    if (monthTimeoutRef.current) {
      clearTimeout(monthTimeoutRef.current);
    }
    setIsLoading(true);
    monthTimeoutRef.current = setTimeout(() => {
      fetchMonthlyTimeline(date.getFullYear(), date.getMonth() + 1);
    }, 300);
  }, [fetchMonthlyTimeline, setIsLoading]);

  const handleDateChange = useCallback((date: Date) => {
    if (dailyTimeoutRef.current) {
      clearTimeout(dailyTimeoutRef.current);
    }
    const dateStr = toLocalYYYYMMDD(date);
    setIsDailyLoading(true);
    dailyTimeoutRef.current = setTimeout(() => {
      fetchDailyTimeline(dateStr).then((data) => {
        setSelectedDayData(data);
        setIsDailyLoading(false);
      }).catch((err) => {
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') {
          return;
        }
        setIsDailyLoading(false);
      });
    }, 150);
  }, [fetchDailyTimeline]);

  if (isLoading && monthlyTimeline.length === 0) {
    return (
      <PageTemplate>
        <div className="mb-6">
          <Text size="2xl" weight="bold" className="text-gray-700 mb-1 text-center">
            Timeline
          </Text>
          <Text size="sm" className="text-gray-600 text-center">
            Track your mission progress and history
          </Text>
        </div>

        <div className="space-y-6 mb-6 pb-32 animate-pulse">
          {/* Calendar Skeleton */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-md h-80 w-full" />
          {/* Mission List Skeleton */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-md h-40 w-full" />
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate>
      <div className="mb-6">
        <Text size="2xl" weight="bold" className="text-gray-700 mb-1 text-center">
          Timeline
        </Text>
        <Text size="sm" className="text-gray-600 text-center">
          Track your mission progress and history
        </Text>
      </div>

      <div className="space-y-6 mb-6 pb-32">
        <TimelineCalendar
          onMonthChange={handleMonthChange}
          onDateChange={handleDateChange}
        />

        {isDailyLoading ? (
          <DailyTimelineSkeleton />
        ) : (
          <MissionListTimeline dayData={selectedDayData} />
        )}
      </div>
    </PageTemplate>
  );
};
