import { useState } from 'react';
import type { CollapsibleSectionProps } from '../../types/collapsibleSection.types';
import { Text } from '../atoms/Text';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export const CollapsibleSection = ({
  title,
  icon,
  children,
  defaultExpanded = false,
}: CollapsibleSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className="bg-white rounded-3xl border border-gray-200 overflow-hidden"
      style={{
        boxShadow:
          '0 4px 6px -1px rgba(125, 184, 224, 0.2), 0 2px 4px -1px rgba(125, 184, 224, 0.1)',
      }}
    >
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-4 transition-colors duration-200 hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
        aria-expanded={isExpanded}
        aria-label={`Toggle ${title} section`}
      >
        <div className="flex items-center gap-3">
          <div className="text-[#7DB8E0] flex-shrink-0">{icon}</div>
          <Text size="base" weight="semibold" className="text-gray-700">
            {title}
          </Text>
        </div>
        <div className="text-gray-400 flex-shrink-0 transition-transform duration-200">
          {isExpanded ? (
            <ChevronDownIcon className="w-5 h-5" />
          ) : (
            <ChevronRightIcon className="w-5 h-5" />
          )}
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pt-0">
          <div className="pt-2">{children}</div>
        </div>
      </div>
    </div>
  );
};

