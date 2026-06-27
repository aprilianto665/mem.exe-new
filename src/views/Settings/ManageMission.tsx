import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "../../components/templates/PageTemplate";
import { Text } from "../../components/atoms/Text";
import { Input } from "../../components/atoms/Input";
import { FilterModal } from "../../components/molecules/FilterModal";
import { useMissionStore } from "../../store/missionStore";
import {
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  AdjustmentsHorizontalIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  getStatusBadge,
  getMissionAccentClass,
  getMissionProgressSubtext,
} from "../../utils/missionDisplay";

export const ManageMission = () => {
  const navigate = useNavigate();
  const { missions, fetchMissions, isLoading } = useMissionStore();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  return (
    <PageTemplate>
      <div className="flex flex-col" style={{ height: "calc(100vh - 200px)" }}>
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 mb-6 relative flex items-center justify-center">
          <button
            onClick={() => navigate("/settings")}
            className="absolute left-0 flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <ArrowLeftIcon strokeWidth={2} className="w-5 h-5" />
            <Text size="sm" weight="semibold">
              Settings
            </Text>
          </button>

          <Text size="2xl" weight="bold" className="text-gray-700">
            Manage Mission
          </Text>
        </div>

        {/* Search Bar & Filter Section - Also Fixed */}
        <div className="flex-shrink-0 mb-6 px-1 flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600">
              <MagnifyingGlassIcon strokeWidth={2} className="h-5 w-5" />
            </div>
            <Input
              placeholder="Search your missions..."
              className="pl-11 !bg-[#E5E7EB] !placeholder-gray-600"
              variant="noBorder"
            />
          </div>
          <button
            className="p-3 bg-transparent rounded-2xl text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Filter missions"
            onClick={() => setIsFilterModalOpen(true)}
          >
            <AdjustmentsHorizontalIcon strokeWidth={2} className="w-6 h-6" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex-shrink-0 flex items-center gap-4 mb-4 px-1">
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-md bg-[#7DB8E0] shadow-sm"
              aria-hidden
            />
            <Text
              size="xs"
              weight="medium"
              className="text-gray-500 uppercase tracking-wide"
            >
              Daily Habit
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-md bg-purple-400 shadow-sm"
              aria-hidden
            />
            <Text
              size="xs"
              weight="medium"
              className="text-gray-500 uppercase tracking-wide"
            >
              Challenge
            </Text>
          </div>
        </div>

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
          <div className="space-y-3">
            {isLoading ? (
              // Premium Skeleton Loading Cards
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="relative w-full flex items-center gap-3 overflow-hidden bg-white rounded-2xl pl-5 pr-4 py-4 border border-gray-100 shadow-sm text-left animate-pulse"
                >
                  {/* Left accent strip placeholder */}
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-gray-200" aria-hidden />

                  {/* Center placeholder */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-5 bg-gray-200 rounded-md w-1/3" />
                    <div className="h-3.5 bg-gray-100 rounded-md w-1/2" />
                  </div>

                  {/* Right placeholder */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <div className="h-6 w-16 bg-gray-200 rounded-full" />
                    <div className="w-5 h-5 bg-gray-200 rounded-full" />
                  </div>
                </div>
              ))
            ) : missions.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <Text size="base" className="text-gray-400">
                  No missions found
                </Text>
              </div>
            ) : (
              missions.map((mission) => (
                <button
                  key={mission.id}
                  type="button"
                  onClick={() => navigate(`/settings/manage/${mission.id}`)}
                  aria-label={`View details for ${mission.name}`}
                  className="relative w-full flex items-center gap-3 overflow-hidden bg-white rounded-2xl pl-5 pr-4 py-4 border border-gray-100 shadow-sm text-left hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {/* Left accent strip - absolute, flush left, clipped by card rounded corners */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-2 ${getMissionAccentClass(mission.commitmentType)}`}
                    aria-hidden
                  />

                  {/* Center: title + sub-info */}
                  <div className="flex-1 min-w-0">
                    <Text
                      size="lg"
                      weight="bold"
                      className="text-gray-700 block truncate"
                    >
                      {mission.name}
                    </Text>
                    <Text size="sm" className="text-gray-500 mt-0.5">
                      {getMissionProgressSubtext(mission)}
                    </Text>
                  </div>

                  {/* Right: status badge + chevron */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {getStatusBadge(mission.status)}
                    <ChevronRightIcon
                      strokeWidth={2}
                      className="w-5 h-5 text-gray-400"
                      aria-hidden
                    />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />
    </PageTemplate>
  );
};
