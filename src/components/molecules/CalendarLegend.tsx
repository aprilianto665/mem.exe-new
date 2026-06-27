import { Text } from '../atoms/Text';

export const CalendarLegend = () => {
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-green-400 rounded-md flex-shrink-0 shadow-sm" />
        <Text size="xs" className="text-gray-600">
          Completed
        </Text>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-400 rounded-md flex-shrink-0 shadow-sm" />
        <Text size="xs" className="text-gray-600">
          Mission failed
        </Text>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-[#7DB8E0] rounded-md flex-shrink-0 shadow-sm" />
        <Text size="xs" className="text-gray-600">
          Daily habits
        </Text>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-[#A78BFA] rounded-md flex-shrink-0 shadow-sm" />
        <Text size="xs" className="text-gray-600">
          Challenges
        </Text>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-amber-400 rounded-md flex-shrink-0 shadow-sm" />
        <Text size="xs" className="text-gray-600">
          Target To-Dos
        </Text>
      </div>
    </div>
  );
};

