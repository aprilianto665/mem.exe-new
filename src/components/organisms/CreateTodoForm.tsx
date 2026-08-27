import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { FormSection } from '../molecules/FormSection';
import { Button } from '../atoms/Button';
import { TrophyIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useMissionStore } from '../../store/missionStore';
import toast from 'react-hot-toast';

export const CreateTodoForm = () => {
  const router = useRouter();
  const { addMilestone } = useMissionStore();

  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneDeadline, setMilestoneDeadline] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  const handleAddSubtask = () => {
    const trimmed = newSubtask.trim();
    if (!trimmed) return;
    setSubtasks((prev) => [...prev, trimmed]);
    setNewSubtask('');
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDownSubtask = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) {
      toast.error('Objective title is required!');
      return;
    }

    const finalSubtasks = [...subtasks];
    if (newSubtask.trim()) {
      finalSubtasks.push(newSubtask.trim());
    }

    try {
      await addMilestone({
        title: milestoneTitle,
        description: milestoneDesc || undefined,
        deadline: milestoneDeadline || undefined,
        subtasks: finalSubtasks.length > 0 ? finalSubtasks : undefined,
      });

      toast.success(`Objective "${milestoneTitle}" added!`);
      router.push('/todo');
    } catch (err: any) {
      toast.error('Connection error. Unable to create objective.');
    }
  };

  return (
    <form onSubmit={handleCreateMilestone} className="space-y-6">
      <FormSection title="OBJECTIVE TITLE">
        <Input
          placeholder="e.g. Complete a major project, Master a new skill"
          value={milestoneTitle}
          onChange={(e) => setMilestoneTitle(e.target.value)}
          variant="noBorder"
          autoFocus
        />
      </FormSection>

      <FormSection title="DESCRIPTION (OPTIONAL)">
        <Textarea
          placeholder="Describe what success looks like..."
          value={milestoneDesc}
          onChange={(e) => setMilestoneDesc(e.target.value)}
          variant="noBorder"
          rows={3}
        />
      </FormSection>

      <FormSection title="DEADLINE TARGET (OPTIONAL)">
        <Input
          type="date"
          value={milestoneDeadline}
          onChange={(e) => setMilestoneDeadline(e.target.value)}
          onClick={(e) => {
            try {
              e.currentTarget.showPicker();
            } catch (err) {}
          }}
          variant="noBorder"
          className="w-full text-gray-800 cursor-pointer"
        />
      </FormSection>

      <FormSection title="SUB-QUESTS / MILESTONES (OPTIONAL)">
        <div className="space-y-3">
          {subtasks.length > 0 && (
            <div className="space-y-2 mb-3">
              {subtasks.map((task, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2.5 bg-gray-50/80 rounded-2xl border border-gray-100 animate-fadeIn"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#7DB8E0]/15 text-[#7DB8E0] text-[11px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {task}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(idx)}
                    className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Input
              placeholder="e.g. Finish phase 1, Learn basics"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={handleKeyDownSubtask}
              variant="noBorder"
              className="flex-1"
            />
            <Button
              type="button"
              variant="primary"
              onClick={handleAddSubtask}
              className="!py-2.5 !px-4 !rounded-2xl font-semibold text-xs shadow-sm flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <PlusIcon className="w-4 h-4 text-white stroke-[2.5]" />
              <span>Add Quest</span>
            </Button>
          </div>
        </div>
      </FormSection>

      <div className="pt-4">
        <Button
          type="submit"
          variant="primary"
          className="w-full cursor-pointer !py-3 !text-base"
        >
          <TrophyIcon className="w-5 h-5" />
          Save Objective
        </Button>
      </div>
    </form>
  );
};

