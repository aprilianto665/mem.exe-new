import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { FormSection } from '../molecules/FormSection';
import { Button } from '../atoms/Button';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { useMissionStore } from '../../store/missionStore';
import toast from 'react-hot-toast';

export const CreateTodoForm = () => {
  const navigate = useNavigate();
  const { addMilestone } = useMissionStore();

  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneDeadline, setMilestoneDeadline] = useState('');

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) {
      toast.error('Objective title is required!');
      return;
    }

    try {
      await addMilestone({
        title: milestoneTitle,
        description: milestoneDesc || undefined,
        deadline: milestoneDeadline || undefined,
      });

      toast.success(`Objective "${milestoneTitle}" added!`);
      navigate('/todo');
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
