import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { FormSection } from '../molecules/FormSection';
import { FrequencySelector } from '../molecules/FrequencySelector';
import type { FrequencyType, DayOfWeek } from '../../types/frequencySelector.types';
import { CommitmentTypeSelector } from '../molecules/CommitmentTypeSelector';
import type { CommitmentType } from '../../types/commitmentTypeSelector.types';
import { DayInput } from '../molecules/DayInput';
import { MinutesSlider } from '../molecules/MinutesSlider';
import { Button } from '../atoms/Button';
import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import { useMissionStore } from '../../store/missionStore';
import toast from 'react-hot-toast';

export const CreateMissionForm = () => {
  const router = useRouter();
  const { addMission } = useMissionStore();

  const [missionName, setMissionName] = useState('');
  const [missionReason, setMissionReason] = useState('');
  const [commitmentType, setCommitmentType] = useState<CommitmentType>('daily-habit');
  const [frequency, setFrequency] = useState<FrequencyType>('everyday');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([1, 2, 3, 4, 5]); // Default: weekdays
  const [duration, setDuration] = useState(30);
  const [minutesPerDay, setMinutesPerDay] = useState(60);

  const handleSubmit = () => {
    if (!missionName.trim()) {
      toast.error('Mission name is required.');
      return;
    }

    addMission({
      name: missionName,
      reason: missionReason,
      commitmentType,
      commitmentLevel: 'normal',
      frequency,
      selectedDays: frequency === 'custom' ? selectedDays : undefined,
      duration: commitmentType === 'challenge' ? duration : undefined,
      minutesPerDay,
      targetMinutes: minutesPerDay,
      currentMinutes: 0,
      status: 'active',
      streak: 0,
      missed: 0,
    });

    toast.success('Mission created and activated successfully!');
    router.push('/missions');
  };

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <FormSection title="MISSION NAME">
        <div className="space-y-4">
          <Input
            placeholder="e.g. Exercise daily, Study coding"
            value={missionName}
            onChange={(e) => setMissionName(e.target.value)}
            variant="noBorder"
            autoFocus
          />
          <div>
            <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Why is this mission important?
            </label>
            <Textarea
              placeholder="e.g. To stay healthy, to master a new skill"
              value={missionReason}
              onChange={(e) => setMissionReason(e.target.value)}
              variant="noBorder"
              rows={3}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="COMMITMENT TYPE">
        <CommitmentTypeSelector
          value={commitmentType}
          onChange={setCommitmentType}
        />
      </FormSection>

      {commitmentType === 'challenge' && (
        <>
          <FormSection title="FREQUENCY">
            <FrequencySelector
              value={frequency}
              onChange={setFrequency}
              selectedDays={selectedDays}
              onDaysChange={setSelectedDays}
            />
          </FormSection>

          <FormSection title="DURATION (Days)">
            <DayInput
              value={duration}
              onChange={setDuration}
            />
          </FormSection>
        </>
      )}

      <FormSection
        title="MINUTES PER DAY"
        titleRight={
          <span className={`text-lg font-bold ${minutesPerDay > 180 ? 'text-[#F6657E]' : 'text-[#7DB8E0]'}`}>
            {minutesPerDay}m
          </span>
        }
      >
        <MinutesSlider
          value={minutesPerDay}
          onChange={setMinutesPerDay}
          min={15}
          max={240}
          step={5}
        />
      </FormSection>

      <div className="pt-4">
        <Button
          type="button"
          variant="primary"
          className="w-full cursor-pointer !py-3 !text-base"
          onClick={handleSubmit}
        >
          <RocketLaunchIcon className="w-5 h-5" />
          Create Mission
        </Button>
      </div>
    </form>
  );
};
