"use client";

import { useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageTemplate } from "../../components/templates/PageTemplate";
import { Text } from "../../components/atoms/Text";
import { Button } from "../../components/atoms/Button";
import { FormSection } from "../../components/molecules/FormSection";
import { useMissionStore } from "../../store/missionStore";
import toast from "react-hot-toast";
import type { Mission } from "../../types/mission.types";
import {
  getCommitmentTypeLabel,
  getFrequencyLabel,
  getStatusBadge,
} from "../../utils/missionDisplay";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

type RouteParams = {
  missionId?: string;
};

const formatTotalTime = (totalMinutes?: number): string => {
  if (!totalMinutes) return "0 min";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }
  if (minutes === 0) {
    return `${hours} hour`;
  }
  return `${hours} hour ${minutes} min`;
};

export const MissionDetail = () => {
  const router = useRouter();
  const params = useParams();
  const missionId = (params?.missionId as string) || undefined;
  const { missions, deleteMission, fetchMissionDetail, isLoading } = useMissionStore();

  useEffect(() => {
    if (missionId) {
      fetchMissionDetail(missionId);
    }
  }, [missionId, fetchMissionDetail]);

  const mission: Mission | undefined = useMemo(
    () => missions.find((m) => m.id === missionId),
    [missionId, missions]
  );

  const handleBack = () => {
    router.push("/settings/manage");
  };

  const handleEdit = () => {
    router.push("/settings/manage/edit");
  };

  const handleDelete = () => {
    if (missionId && window.confirm('Are you sure you want to delete this mission?')) {
      deleteMission(missionId);
      toast.success('Mission deleted successfully.');
      router.push("/settings/manage");
    }
  };

  const renderNotFound = () => (
    <PageTemplate>
      <div className="flex flex-col h-full pb-32">
        <div className="flex-shrink-0 mb-6 relative flex items-center justify-center">
          <button
            onClick={handleBack}
            className="absolute left-0 flex items-center gap-1.5 text-gray-600 hover:text-gray-800 cursor-pointer px-2 py-1 rounded-xl hover:bg-white/50"
          >
            <ArrowLeftIcon strokeWidth={2.5} className="w-5 h-5" />
            <Text size="sm" weight="semibold">
              Back
            </Text>
          </button>

          <Text size="2xl" weight="bold" className="text-gray-800">
            Mission Details
          </Text>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center max-w-sm">
            <Text size="lg" weight="bold" className="text-gray-800 mb-2">
              Mission not found
            </Text>
            <Text size="sm" className="text-gray-500 mb-4">
              The mission you are looking for does not exist or has been
              removed.
            </Text>
            <Button
              variant="primary"
              className="w-full !py-3 !text-base"
              type="button"
              onClick={handleBack}
            >
              Back to Manage Mission
            </Button>
          </div>
        </div>
      </div>
    </PageTemplate>
  );

  if (isLoading) {
    return (
      <PageTemplate>
        <div className="flex flex-col h-full pb-32 animate-pulse">
          {/* Header */}
          <div className="flex-shrink-0 mb-6 relative flex items-center justify-center">
            <button
              onClick={handleBack}
              className="absolute left-0 flex items-center gap-1.5 text-gray-600 hover:text-gray-800 cursor-pointer px-2 py-1 rounded-xl hover:bg-white/50"
            >
              <ArrowLeftIcon strokeWidth={2.5} className="w-5 h-5" />
              <Text size="sm" weight="semibold">
                Back
              </Text>
            </button>

            <Text size="2xl" weight="bold" className="text-gray-700">
              Detail Mission
            </Text>
          </div>

          {/* Content Skeletons */}
          <div className="flex-1 space-y-4">
            {/* Overview Card Skeleton */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded-md w-1/4" />
                <div className="h-6 bg-gray-200 rounded-md w-1/2" />
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-20 flex-shrink-0" />
            </div>

            {/* Split Row Skeleton */}
            <div className="flex gap-3">
              {/* Why this mission matters Card Skeleton */}
              <div className="flex-[2] min-w-0 bg-white rounded-3xl p-5 shadow-sm flex flex-col gap-2">
                <div className="h-3.5 bg-gray-100 rounded-md w-1/3" />
                <div className="space-y-2 mt-1">
                  <div className="h-4 bg-gray-200 rounded-md w-full" />
                  <div className="h-4 bg-gray-200 rounded-md w-5/6" />
                </div>
              </div>

              {/* Type Card Skeleton */}
              <div className="flex-1 min-w-0 bg-white rounded-3xl p-5 shadow-sm flex flex-col gap-2">
                <div className="h-3.5 bg-gray-100 rounded-md w-1/2" />
                <div className="h-5 bg-gray-200 rounded-md w-3/4 mt-1" />
              </div>
            </div>

            {/* Minutes per day & Frequency row Skeleton */}
            <div className="flex gap-3">
              <div className="flex-1 min-w-0 bg-white rounded-3xl p-5 shadow-sm flex flex-col gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full" />
                <div className="h-3.5 bg-gray-100 rounded-md w-2/3" />
                <div className="h-5 bg-gray-200 rounded-md w-1/2" />
              </div>

              <div className="flex-1 min-w-0 bg-white rounded-3xl p-5 shadow-sm flex flex-col gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full" />
                <div className="h-3.5 bg-gray-100 rounded-md w-2/3" />
                <div className="h-5 bg-gray-200 rounded-md w-1/2" />
              </div>
            </div>

            {/* Progress Card Skeleton */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
              <div className="flex flex-nowrap gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-1 text-center space-y-2">
                    <div className="h-3.5 bg-gray-100 rounded-md w-1/2 mx-auto" />
                    <div className="h-5 bg-gray-200 rounded-md w-2/3 mx-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Card Skeleton */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
              <div className="flex flex-nowrap gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex-1 text-center space-y-2">
                    <div className="h-3.5 bg-gray-100 rounded-md w-1/2 mx-auto" />
                    <div className="h-5 bg-gray-200 rounded-md w-2/3 mx-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Buttons Skeleton */}
            <div className="flex gap-2 pt-2">
              <div className="flex-1 h-12 bg-gray-200 rounded-3xl" />
              <div className="flex-1 h-12 bg-gray-200 rounded-3xl" />
            </div>
          </div>
        </div>
      </PageTemplate>
    );
  }

  if (!mission) {
    return renderNotFound();
  }

  return (
    <PageTemplate>
      <div className="flex flex-col h-full pb-32">
        {/* Header */}
        <div className="flex-shrink-0 mb-6 relative flex items-center justify-center">
          <button
            onClick={handleBack}
            className="absolute left-0 flex items-center gap-1.5 text-gray-600 hover:text-gray-800 cursor-pointer px-2 py-1 rounded-xl hover:bg-white/50"
          >
            <ArrowLeftIcon strokeWidth={2.5} className="w-5 h-5" />
            <Text size="sm" weight="semibold">
              Back
            </Text>
          </button>

          <Text size="2xl" weight="bold" className="text-gray-700">
            Detail Mission
          </Text>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4 overflow-y-auto">
          {/* Overview */}
          <FormSection>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <Text size="sm" weight="semibold" className="text-gray-400 uppercase mb-1">
                  Mission name
                </Text>
                <Text size="lg" weight="bold" className="text-gray-700">
                  {mission.name}
                </Text>
              </div>
              <div className="flex-shrink-0">{getStatusBadge(mission.status)}</div>
            </div>
          </FormSection>

          {/* Split Row: Why this mission matters (Left) and Type (Right) */}
          <div className="flex gap-3">
            {/* Why this mission matters Card */}
            <div className="flex-[2] min-w-0 bg-white rounded-3xl p-5 shadow-sm flex flex-col gap-2">
              <Text
                size="xs"
                weight="semibold"
                className="text-gray-400 uppercase"
              >
                Why this mission matters
              </Text>
              <Text size="sm" className="text-gray-700 font-medium leading-relaxed break-words">
                {mission.reason || "No description provided."}
              </Text>
            </div>

            {/* Type Card */}
            <div className="flex-1 min-w-0 bg-white rounded-3xl p-5 shadow-sm flex flex-col gap-2">
              <Text
                size="xs"
                weight="semibold"
                className="text-gray-400 uppercase"
              >
                Type
              </Text>
              <Text size="sm" weight="bold" className="text-gray-700">
                {getCommitmentTypeLabel(mission.commitmentType)}
              </Text>
            </div>
          </div>

          {/* Minutes per day & Frequency - two cards in one row */}
          <div className="flex gap-3">
            <div className="flex-1 min-w-0 bg-white rounded-3xl p-5 shadow-sm flex flex-col gap-2">
              <ClockIcon className="w-6 h-6 text-gray-500" strokeWidth={2} />
              <Text
                size="xs"
                weight="normal"
                className="text-gray-500 uppercase"
              >
                Minutes per day
              </Text>
              <Text size="sm" weight="bold" className="text-gray-700">
                {mission.minutesPerDay} min
              </Text>
            </div>

            <div className="flex-1 min-w-0 bg-white rounded-3xl p-5 shadow-sm flex flex-col gap-2">
              <CalendarDaysIcon className="w-6 h-6 text-gray-500" strokeWidth={2} />
              <Text
                size="xs"
                weight="normal"
                className="text-gray-500 uppercase"
              >
                Frequency
              </Text>
              <Text size="sm" weight="bold" className="text-gray-700 break-words">
                {getFrequencyLabel(mission)}
              </Text>
            </div>
          </div>

          {/* Progress - one row: Days progress, Streak, Missed */}
          <FormSection>
            <div className="flex flex-nowrap gap-4">
              <div className="flex-1 min-w-0 text-center">
                <Text
                  size="xs"
                  weight="semibold"
                  className="text-gray-400 uppercase mb-1"
                >
                  Days progress
                </Text>
                <Text
                  size="sm"
                  weight="semibold"
                  className="text-gray-700"
                >
                  {mission.currentDays !== undefined
                    ? mission.commitmentType === "challenge" && mission.duration
                      ? `Day ${mission.currentDays} of ${mission.duration}`
                      : `Day ${mission.currentDays}`
                    : "-"}
                </Text>
              </div>
              <div className="flex-1 min-w-0 text-center">
                <Text
                  size="xs"
                  weight="semibold"
                  className="text-gray-400 uppercase mb-1"
                >
                  Streak
                </Text>
                <Text
                  size="sm"
                  weight="semibold"
                  className="text-gray-700"
                >
                  {mission.streak ?? 0} days
                </Text>
              </div>
              <div className="flex-1 min-w-0 text-center">
                <Text
                  size="xs"
                  weight="semibold"
                  className="text-gray-400 uppercase mb-1"
                >
                  Missed
                </Text>
                <Text
                  size="sm"
                  weight="semibold"
                  className="text-gray-700"
                >
                  {mission.missed ?? 0} days
                </Text>
              </div>
            </div>
          </FormSection>

          {/* Statistics - Total Time & Average Time */}
          <FormSection>
            <div className="flex flex-nowrap gap-4">
              <div className="flex-1 min-w-0 text-center">
                <Text
                  size="xs"
                  weight="semibold"
                  className="text-gray-400 uppercase mb-1"
                >
                  Total Time
                </Text>
                <Text
                  size="sm"
                  weight="semibold"
                  className="text-gray-700"
                >
                  {formatTotalTime(mission.totalMinutesDone)}
                </Text>
              </div>
              <div className="flex-1 min-w-0 text-center">
                <Text
                  size="xs"
                  weight="semibold"
                  className="text-gray-400 uppercase mb-1"
                >
                  Average Time
                </Text>
                <Text
                  size="sm"
                  weight="semibold"
                  className="text-gray-700"
                >
                  {mission.averageMinutesDone ?? 0} min/day
                </Text>
              </div>
            </div>
          </FormSection>

          {/* Actions */}
          {mission.status !== 'completed' && mission.status !== 'canceled' && (
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1 bg-[#7DB8E0] hover:bg-[#6BA7CF]"
                type="button"
                aria-label="Edit mission"
                onClick={handleEdit}
              >
                <PencilIcon strokeWidth={2} className="w-5 h-5" />
                <span>Edit</span>
              </Button>
              <Button
                className="flex-1 bg-[#FF6467] hover:bg-[#E5555A]"
                type="button"
                aria-label="Delete mission"
                onClick={handleDelete}
              >
                <TrashIcon strokeWidth={2} className="w-5 h-5" />
                <span>Delete</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageTemplate>
  );
};

