import { useId } from "react";
import type { CommitmentTypeSelectorProps } from "../../types/commitmentTypeSelector.types";

export const CommitmentTypeSelectorSimple = ({
  value,
  onChange,
}: CommitmentTypeSelectorProps) => {
  const dailyHabitId = useId();
  const challengeId = useId();

  return (
    <div className="space-y-3">
      <div
        className={`rounded-2xl p-4 bg-[#F8FAFC] cursor-pointer ${
          value === "daily-habit"
            ? "border-2 border-[#7DB8E0]"
            : "border border-transparent"
        }`}
        onClick={() => onChange("daily-habit")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange("daily-habit");
          }
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <label
              htmlFor={dailyHabitId}
              className="block text-base font-medium text-gray-900 cursor-pointer"
            >
              Daily Habit
            </label>
          </div>
          <input
            type="radio"
            id={dailyHabitId}
            checked={value === "daily-habit"}
            onChange={() => onChange("daily-habit")}
            name="commitment-type-edit"
            className={`w-5 h-5 border-2 cursor-pointer appearance-none rounded-full bg-white mt-1 ${
              value === "daily-habit" ? "border-[#7DB8E0]" : "border-gray-300"
            }`}
            style={{
              backgroundImage:
                value === "daily-habit"
                  ? "radial-gradient(circle, white 6px, #7DB8E0 6px, #7DB8E0 100%)"
                  : "none",
            }}
          />
        </div>
      </div>
      <div
        className={`rounded-2xl p-4 bg-[#F8FAFC] cursor-pointer ${
          value === "challenge"
            ? "border-2 border-[#7DB8E0]"
            : "border border-transparent"
        }`}
        onClick={() => onChange("challenge")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange("challenge");
          }
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <label
              htmlFor={challengeId}
              className="block text-base font-medium text-gray-900 cursor-pointer"
            >
              Challenge
            </label>
          </div>
          <input
            type="radio"
            id={challengeId}
            checked={value === "challenge"}
            onChange={() => onChange("challenge")}
            name="commitment-type-edit"
            className={`w-5 h-5 border-2 cursor-pointer appearance-none rounded-full bg-white mt-1 ${
              value === "challenge" ? "border-[#7DB8E0]" : "border-gray-300"
            }`}
            style={{
              backgroundImage:
                value === "challenge"
                  ? "radial-gradient(circle, white 6px, #7DB8E0 6px, #7DB8E0 100%)"
                  : "none",
            }}
          />
        </div>
      </div>
    </div>
  );
};

