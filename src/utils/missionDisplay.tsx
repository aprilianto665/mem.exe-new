import type { Mission } from "../types/mission.types";

/** Tailwind class for left accent strip by commitment type (blue = daily-habit, purple = challenge). */
export const getMissionAccentClass = (
  type: Mission["commitmentType"]
): string =>
  type === "challenge" ? "bg-purple-400" : "bg-[#7DB8E0]";

/** Short progress line: "Day X/Y • Z min/day" or "Day X • Z min/day". */
export const getMissionProgressSubtext = (mission: Mission): string => {
  const dayPart =
    mission.currentDays === undefined
      ? "—"
      : mission.commitmentType === "challenge" && mission.duration != null
        ? `Day ${mission.currentDays}/${mission.duration}`
        : `Day ${mission.currentDays}`;
  return `${dayPart} • ${mission.minutesPerDay} min/day`;
};

export const getCommitmentTypeLabel = (
  type: Mission["commitmentType"]
): string => (type === "daily-habit" ? "Daily Habit" : "Challenge");

export const getFrequencyLabel = (mission: Mission): string => {
  if (mission.frequency === "everyday") return "Everyday";

  if (mission.frequency === "custom" && mission.selectedDays) {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return mission.selectedDays.map((day) => dayNames[day]).join(", ");
  }

  return "Custom";
};

export const getStatusBadge = (status?: Mission["status"]) => {

  if (status === "active") {
    return (
      <span className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-semibold uppercase">
        Active
      </span>
    );
  }

  if (status === "completed") {
    return (
      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold uppercase">
        Completed
      </span>
    );
  }

  if (status === "canceled") {
    return (
      <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold uppercase">
        Canceled
      </span>
    );
  }

  return null;
};

