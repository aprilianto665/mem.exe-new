import { CollapsibleSection } from './CollapsibleSection';
import { Text } from '../atoms/Text';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface AboutSectionProps {
  noCard?: boolean;
}

export const AboutSection = ({ noCard }: AboutSectionProps) => {
  return (
    <CollapsibleSection
      title="About"
      icon={<InformationCircleIcon className="w-6 h-6" />}
      defaultExpanded={false}
      noCard={noCard}
    >
      <div className="space-y-3 px-4">
        <Text size="base" className="text-gray-700 leading-relaxed">
          <strong>mem.exe</strong> is a personal execution system designed to help you
          build discipline through clear commitments and consistent daily action.
        </Text>
        <Text size="base" className="text-gray-700 leading-relaxed">
          The name <strong>mem.exe</strong> is inspired by the pink goblin character (Cyrene) from{' '}
          <strong>Honkai: Star Rail</strong>, symbolizing the idea of a system that quietly runs in the background of your daily life. Rather than functioning as a simple task list, mem.exe treats each mission as a commitment something to be executed, tracked, and reflected upon with intention.
        </Text>
        <Text size="base" className="text-gray-700 leading-relaxed">
          With mem.exe, you create missions in two primary forms: <strong>Daily Habits</strong> and <strong>Challenges</strong>. Daily Habits focus on building long-term discipline through repetition, while Challenges provide a structured, time-bound commitment for focused growth. In both cases, the emphasis is not on finishing tasks quickly, but on showing up consistently and executing what you committed to do.
        </Text>
        <Text size="base" className="text-gray-700 leading-relaxed">
          Each mission is defined by a clear daily duration and executed through a structured timer system. Progress is measured through accumulated time and consistency, allowing you to see tangible proof of your effort over time. The system is designed to reward discipline, not perfection missed days are tracked honestly, and consequences are part of the process, not something to be hidden.
        </Text>
        <Text size="base" className="text-gray-700 leading-relaxed">
          Many of the core principles behind mem.exe are inspired by{' '}
          <strong>Atomic Habits</strong> by James Clear. Instead of relying on
          motivation or willpower, mem.exe focuses on building systems rather than chasing outcomes, reinforcing identity through repeated action, making progress visible and measurable, and creating clear consequences for breaking commitments.
        </Text>
        <Text size="base" className="text-gray-700 leading-relaxed">
          By emphasizing small, repeatable actions and honest tracking, mem.exe turns discipline from an abstract idea into a daily practice. Over time, these consistent executions compound into meaningful progress one mission at a time.
        </Text>
      </div>
    </CollapsibleSection>
  );
};
