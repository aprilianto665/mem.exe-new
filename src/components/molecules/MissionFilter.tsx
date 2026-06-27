import { useState } from 'react';

type FilterType = 'all' | 'daily' | 'challenge';

export const MissionFilter = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'daily', label: 'Daily Habits' },
    { id: 'challenge', label: 'Challenge' },
  ];

  return (
    <div className="flex gap-2 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => setActiveFilter(filter.id)}
          className={`px-6 py-2 rounded-full font-medium transition-colors cursor-pointer ${
            activeFilter === filter.id
              ? 'bg-[#7DB8E0] text-white'
              : 'bg-[#E5E7EB] text-gray-700 hover:bg-gray-300'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};
