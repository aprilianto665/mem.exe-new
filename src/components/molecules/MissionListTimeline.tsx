import type { MissionListTimelineProps } from '../../types/missionListTimeline.types';
import { Text } from '../atoms/Text';
import type { MissionCompletionStatus } from '../../types/missionHistory.types';
import { 
  CheckCircleIcon, 
  ClockIcon,
  FlagIcon
} from '@heroicons/react/24/outline';

const getStatusLabel = (status: MissionCompletionStatus) => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'pending':
      return 'Pending';
    default:
      return 'Unknown';
  }
};

const getStatusTextColor = (status: MissionCompletionStatus) => {
  switch (status) {
    case 'completed':
      return 'text-green-600';
    case 'failed':
      return 'text-red-600';
    case 'pending':
      return 'text-gray-500';
    default:
      return 'text-gray-500';
  }
};

const getCommitmentTypeColor = (commitmentType: string) => {
  return commitmentType === 'challenge' ? 'bg-[#A78BFA]' : 'bg-[#7DB8E0]';
};

export const MissionListTimeline = ({
  dayData,
  className = '',
}: MissionListTimelineProps) => {
  if (!dayData) {
    return (
      <div className={className}>
        <div className="mb-6">
          <Text size="2xl" weight="bold" className="text-gray-700">
            Activity Details
          </Text>
        </div>
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm text-center">
          <ClockIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <Text size="sm" className="text-gray-400 font-medium">
            Select a date to view mission list
          </Text>
        </div>
      </div>
    );
  }

  const hasMissions = dayData.missions.length > 0;
  const hasMilestones = dayData.milestones && dayData.milestones.length > 0;

  if (!hasMissions && !hasMilestones) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-6">
          <Text size="2xl" weight="bold" className="text-gray-700">
            Activity Details
          </Text>
          <Text size="sm" weight="medium" className="text-gray-500">
            {new Date(dayData.date.replace(/-/g, '/')).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </div>
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm text-center">
          <FlagIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <Text size="sm" className="text-gray-400 font-medium">
            No missions or objectives scheduled for this day
          </Text>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(dayData.date.replace(/-/g, '/')).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className={className}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <Text size="2xl" weight="bold" className="text-gray-700">
          Activity Details
        </Text>
        <Text size="sm" weight="medium" className="text-gray-500">
          {formattedDate}
        </Text>
      </div>

      {/* Grid structure to separate Missions and To-Dos perfectly */}
      <div className="space-y-6">

        {/* 1. Missions Section */}
        {hasMissions && (
          <div className="space-y-3 text-left">
            <div className="mb-1 px-1">
              <Text size="base" weight="bold" className="text-gray-500 uppercase tracking-wide">
                Daily Missions ({dayData.missions.length})
              </Text>
            </div>
            
            <div className="relative pl-4 space-y-4">
              {/* Timeline Connector Line */}
              {dayData.missions.length > 1 && (
                <div className="absolute left-[22px] top-[21px] bottom-[21px] w-0.5 bg-slate-200"></div>
              )}

              {dayData.missions.map(({ mission, completion }) => {
                const status: MissionCompletionStatus = completion?.status || 'pending';
                const dotColor = getCommitmentTypeColor(mission.commitmentType);
                const targetMin = completion?.targetMinutes || mission.minutesPerDay || mission.targetMinutes;
                const completedMin = completion?.completedMinutes || 0;

                return (
                  <div key={mission.id} className="relative flex items-start gap-4">
                    {/* Tiny bullet overlaying vertical line */}
                    <div className="relative z-10 flex-shrink-0 mt-3.5">
                      <div className={`w-3.5 h-3.5 rounded-full ${dotColor} border-2 border-white shadow-sm`}></div>
                    </div>

                    {/* Mission Card container */}
                    <div className="flex-1 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="text-left">
                          <Text size="base" weight="bold" className="text-gray-800 break-words">
                            {mission.name}
                          </Text>
                          {mission.reason && (
                            <Text size="xs" className="text-gray-400 mt-0.5 break-words">
                              {mission.reason}
                            </Text>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusTextColor(
                            status
                          )} bg-opacity-10 ${
                            status === 'completed'
                              ? 'bg-green-100'
                              : status === 'failed'
                              ? 'bg-red-100'
                              : 'bg-gray-100'
                          }`}
                        >
                          {getStatusLabel(status)}
                        </span>
                      </div>

                      {/* Premium Target & completed Progress minutes display */}
                      <div className="flex items-center gap-4 text-xs font-semibold mt-3 text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span>Goal: {targetMin}m</span>
                        </div>
                        <div className="flex items-center gap-1.5 border-l border-gray-100 pl-4">
                          <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                          <span className="text-gray-700">
                            Logged: <span className="text-emerald-500 font-bold">{completedMin}m</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Target To-Dos / Milestones Section */}
        {hasMilestones && (
          <div className="space-y-3 text-left pt-2">
            <div className="mb-1 px-1">
              <Text size="base" weight="bold" className="text-gray-500 uppercase tracking-wide">
                Target To-Dos ({dayData.milestones!.length})
              </Text>
            </div>
            
            <div className="relative pl-4 space-y-4">
              {/* Timeline Connector Line */}
              {dayData.milestones!.length > 1 && (
                <div className="absolute left-[22px] top-[21px] bottom-[21px] w-0.5 bg-slate-200"></div>
              )}

              {dayData.milestones!.map((todo) => {
                const isDone = todo.status === 'completed';

                return (
                  <div key={todo.id} className="relative flex items-start gap-4">
                    {/* Tiny bullet overlaying vertical line */}
                    <div className="relative z-10 flex-shrink-0 mt-3.5">
                      <div className={`w-3.5 h-3.5 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-amber-400'} border-2 border-white shadow-sm`}></div>
                    </div>

                    {/* Todo Card container */}
                    <div className="flex-1 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-left flex-1 min-w-0">
                          <Text 
                            size="base" 
                            weight="bold" 
                            className={`text-gray-800 break-words ${isDone ? 'line-through text-gray-400' : ''}`}
                          >
                            {todo.title}
                          </Text>
                          {todo.description && (
                            <Text size="xs" className="text-gray-400 mt-1 break-words">
                              {todo.description}
                            </Text>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isDone ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'
                          }`}
                        >
                          {isDone ? 'Achieved' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
