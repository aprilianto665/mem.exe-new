"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageTemplate } from "../../components/templates/PageTemplate";
import { Text } from "../../components/atoms/Text";
import { Button } from "../../components/atoms/Button";
import { Input } from "../../components/atoms/Input";
import { Textarea } from "../../components/atoms/Textarea";
import { FormSection } from "../../components/molecules/FormSection";
import { CommitmentTypeSelectorSimple } from "../../components/molecules/CommitmentTypeSelectorSimple";
import type { CommitmentType } from "../../types/commitmentTypeSelector.types";
import { FrequencySelector } from "../../components/molecules/FrequencySelector";
import { DayInput } from "../../components/molecules/DayInput";
import type {
  FrequencyType,
  DayOfWeek,
} from "../../types/frequencySelector.types";
import { MinutesSlider } from "../../components/molecules/MinutesSlider";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export const EditMission = () => {
  const router = useRouter();

  const [missionName, setMissionName] = useState("");
  const [missionReason, setMissionReason] = useState("");
  const [commitmentType, setCommitmentType] =
    useState<CommitmentType>("daily-habit");
  const [frequency, setFrequency] = useState<FrequencyType>("everyday");
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([1, 2, 3, 4, 5]);
  const [duration, setDuration] = useState(30);
  const [minutesPerDay, setMinutesPerDay] = useState(60);

  const handleSaveChanges = () => {
    // TODO: Replace with real update mission API call
    console.log("Save mission changes", {
      missionName,
      missionReason,
      commitmentType,
      commitmentLevel: "normal",
      frequency,
      selectedDays,
      duration,
      minutesPerDay,
    });
  };

  return (
    <PageTemplate>
      <div className="flex flex-col h-full pb-32">
        {/* Header */}
        <div className="flex-shrink-0 mb-6 relative flex items-center justify-center">
          <button
            onClick={() => router.push("/settings/manage")}
            className="absolute left-0 flex items-center gap-1.5 text-gray-600 hover:text-gray-800 cursor-pointer px-2 py-1 rounded-xl hover:bg-white/50"
          >
            <ArrowLeftIcon strokeWidth={2.5} className="w-5 h-5" />
            <Text size="sm" weight="semibold">
              Back
            </Text>
          </button>

          <Text size="2xl" weight="bold" className="text-gray-800">
            Edit Mission
          </Text>
        </div>

        {/* Form Content */}
        <div className="flex-1 space-y-4 overflow-y-auto">
          <FormSection title="MISSION NAME">
            <div className="space-y-4">
              <Input
                placeholder="Mission name (be specific)"
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                variant="noBorder"
              />
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Why is this mission important?
                </label>
                <Textarea
                  placeholder="Describe why this mission matters (optional)"
                  value={missionReason}
                  onChange={(e) => setMissionReason(e.target.value)}
                  variant="noBorder"
                  rows={3}
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="COMMITMENT, SCHEDULE & MINUTES">
            <div className="space-y-6">
              {/* Commitment Type */}
              <div className="space-y-2">
                <Text
                  size="xs"
                  weight="semibold"
                  className="text-gray-600 uppercase"
                >
                  Commitment type
                </Text>
                <CommitmentTypeSelectorSimple
                  value={commitmentType}
                  onChange={setCommitmentType}
                />
              </div>

              {/* Schedule - only for challenge type */}
              {commitmentType === "challenge" && (
                <div className="space-y-2">
                  <Text
                    size="xs"
                    weight="semibold"
                    className="text-gray-600 uppercase"
                  >
                    Schedule
                  </Text>
                  <FrequencySelector
                    value={frequency}
                    onChange={setFrequency}
                    selectedDays={selectedDays}
                    onDaysChange={setSelectedDays}
                  />
                </div>
              )}

              {/* Duration (days) - only for challenge type */}
              {commitmentType === "challenge" && (
                <div className="space-y-2">
                  <Text
                    size="xs"
                    weight="semibold"
                    className="text-gray-600 uppercase"
                  >
                    Duration (days)
                  </Text>
                  <DayInput value={duration} onChange={setDuration} />
                </div>
              )}

              {/* Minutes per day */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Text
                    size="xs"
                    weight="semibold"
                    className="text-gray-600 uppercase"
                  >
                    Minutes per day
                  </Text>
                  <span
                    className={`text-lg font-bold ${
                      minutesPerDay > 180 ? "text-[#F6657E]" : "text-[#7DB8E0]"
                    }`}
                  >
                    {minutesPerDay}m
                  </span>
                </div>
                <MinutesSlider
                  value={minutesPerDay}
                  onChange={setMinutesPerDay}
                  min={15}
                  max={240}
                  step={5}
                />
              </div>
            </div>
          </FormSection>

          <Button
            variant="primary"
            className="w-full !py-3 !text-base"
            type="button"
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </PageTemplate>
  );
};
