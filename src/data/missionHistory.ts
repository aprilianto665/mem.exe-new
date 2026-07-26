import type { Mission } from '../types/mission.types';
import type {
  MissionCompletion,
  MissionDayStatus,
  DayMissionData,
} from '../types/missionHistory.types';
import type { DayOfWeek } from '../types/frequencySelector.types';

export const toLocalYYYYMMDD = (date: Date): string => {
  const dYear = date.getFullYear();
  const dMonth = String(date.getMonth() + 1).padStart(2, '0');
  const dDay = String(date.getDate()).padStart(2, '0');
  return `${dYear}-${dMonth}-${dDay}`;
};

const isSameOrAfterDateOnly = (date: Date, start: Date) => {
  const dYear = date.getFullYear();
  const dMonth = date.getMonth();
  const dDay = date.getDate();

  const sYear = start.getFullYear();
  const sMonth = start.getMonth();
  const sDay = start.getDate();

  if (dYear > sYear) return true;
  if (dYear < sYear) return false;

  if (dMonth > sMonth) return true;
  if (dMonth < sMonth) return false;

  return dDay >= sDay;
};

const isBeforeChallengeEnd = (date: Date, start: Date, durationDays: number, selectedDays?: number[]) => {
  let activeDaysCount = 0;
  const temp = new Date(start);
  let lastActiveDate = new Date(start);
  
  for (let i = 0; i < 5 * 365; i++) {
    const dayOfWeek = temp.getDay();
    let isScheduled = false;
    
    if (selectedDays && selectedDays.length > 0) {
      if (selectedDays.length === 7) {
        isScheduled = true;
      } else {
        isScheduled = selectedDays.includes(dayOfWeek);
      }
    } else {
      isScheduled = true;
    }
    
    if (isScheduled) {
      activeDaysCount++;
      lastActiveDate = new Date(temp);
      if (activeDaysCount === durationDays) {
        break;
      }
    }
    
    temp.setDate(temp.getDate() + 1);
  }
  
  const dYear = date.getFullYear();
  const dMonth = date.getMonth();
  const dDay = date.getDate();

  const eYear = lastActiveDate.getFullYear();
  const eMonth = lastActiveDate.getMonth();
  const eDay = lastActiveDate.getDate();

  if (dYear < eYear) return true;
  if (dYear > eYear) return false;

  if (dMonth < eMonth) return true;
  if (dMonth > eMonth) return false;

  return dDay <= eDay;
};

const getProjectedEndDateFromToday = (
  today: Date,
  remainingDays: number,
  selectedDays?: number[]
): Date => {
  let count = 0;
  const temp = new Date(today);
  let lastActiveDate = new Date(today);

  for (let i = 0; i < 5 * 365; i++) {
    const dayOfWeek = temp.getDay();
    let isScheduled = false;

    if (selectedDays && selectedDays.length > 0) {
      if (selectedDays.length === 7) {
        isScheduled = true;
      } else {
        isScheduled = selectedDays.includes(dayOfWeek);
      }
    } else {
      isScheduled = true;
    }

    if (isScheduled) {
      count++;
      lastActiveDate = new Date(temp);
      if (count === remainingDays) {
        break;
      }
    }

    temp.setDate(temp.getDate() + 1);
  }

  return lastActiveDate;
};

const doesMilestoneDeadlineMatch = (deadline: string | undefined, date: Date) => {
  if (!deadline) return false;
  const target = new Date(deadline);
  return (
    target.getFullYear() === date.getFullYear() &&
    target.getMonth() === date.getMonth() &&
    target.getDate() === date.getDate()
  );
};

const parseDateStringSafely = (dateStr: string | undefined): Date => {
  if (!dateStr) return new Date();
  
  // If it's a YYYY-MM-DD string
  if (dateStr.length === 10 && dateStr.includes('-')) {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed month
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  
  // ISO string fallback
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return new Date();
  }
  return d;
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Check if a mission should be scheduled on a given date
 */
export const isMissionScheduled = (mission: Mission, date: Date): boolean => {
  if (mission.status === 'canceled') {
    return false;
  }

  const start = parseDateStringSafely(mission.startDate);
  
  // Check if date is before startDate
  if (!isSameOrAfterDateOnly(date, start)) {
    return false;
  }

  // Check frequency & selected days
  const dayOfWeek = date.getDay() as DayOfWeek;
  let isDayOfWeekMatch = false;

  if (mission.commitmentType === 'daily-habit') {
    isDayOfWeekMatch = true;
  } else if (mission.selectedDays && mission.selectedDays.length > 0) {
    if (mission.selectedDays.length === 7) {
      isDayOfWeekMatch = true;
    } else {
      isDayOfWeekMatch = mission.selectedDays.includes(dayOfWeek);
    }
  } else {
    isDayOfWeekMatch = true;
  }

  if (!isDayOfWeekMatch) return false;

  // Check challenge duration bounds
  if (mission.commitmentType === 'challenge' && mission.duration) {
    if (mission.status === 'completed' || (mission.currentDays && mission.currentDays >= mission.duration)) {
      if (!isBeforeChallengeEnd(date, start, mission.duration, mission.selectedDays)) {
        return false;
      }
    } else {
      const today = new Date();
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const checkDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      if (checkDateOnly > todayDateOnly) {
        const remainingDays = Math.max(1, mission.duration - (mission.currentDays || 0));
        const projectedEnd = getProjectedEndDateFromToday(todayDateOnly, remainingDays, mission.selectedDays);
        if (checkDateOnly > projectedEnd) {
          return false;
        }
      }
    }
  }

  return true;
};

/**
 * Get completion status for a mission on a specific date
 */
export const getMissionCompletionForDate = (
  mission: Mission,
  date: Date,
  history?: any[]
): MissionCompletion => {
  const dateStr = toLocalYYYYMMDD(date);
  const today = new Date();
  
  const isToday = isSameDay(date, today);
  const isFuture = !isToday && date > today;

  if (isToday) {
    const targetMinutes = mission.minutesPerDay || mission.targetMinutes || 60;
    
    // Live running minutes if timer is active
    let completedMinutes = mission.loggedMinutes || 0;
    if (mission.timerStartedAt) {
      const elapsedMs = Date.now() - new Date(mission.timerStartedAt).getTime();
      if (elapsedMs > 0) {
        completedMinutes += Math.floor(elapsedMs / 60000);
      }
    }

    const isCompleted = completedMinutes >= targetMinutes;
    return {
      missionId: mission.id,
      date: dateStr,
      status: isCompleted ? 'completed' : 'pending',
      completedMinutes,
      targetMinutes,
    };
  } else if (isFuture) {
    const targetMinutes = mission.minutesPerDay || mission.targetMinutes || 60;
    return {
      missionId: mission.id,
      date: dateStr,
      status: 'pending',
      completedMinutes: 0,
      targetMinutes,
    };
  } else {
    // Past date: Look up in history list first!
    const targetMinutes = mission.minutesPerDay || mission.targetMinutes || 60;
    if (history) {
      const record = history.find(h => h.missionId === mission.id && h.date === dateStr);
      if (record) {
        const isCompleted = record.status === 'completed' || record.minutesDone >= record.requiredMinutes;
        return {
          missionId: mission.id,
          date: dateStr,
          status: isCompleted ? 'completed' : 'failed',
          completedMinutes: record.minutesDone,
          targetMinutes: record.requiredMinutes || targetMinutes,
        };
      }
    }

    // Fallback: If not found in history, it means it wasn't logged/completed on that day
    return {
      missionId: mission.id,
      date: dateStr,
      status: 'failed',
      completedMinutes: 0,
      targetMinutes,
    };
  }
};

/**
 * Get all missions scheduled for a specific date
 */
export const getMissionsForDate = (date: Date, missions: Mission[]): Mission[] => {
  return missions.filter((mission) => isMissionScheduled(mission, date));
};

/**
 * Check if a day has habits (daily-habit with everyday frequency)
 */
export const hasHabits = (date: Date, missions: Mission[], _milestones: any[] = []): boolean => {
  const scheduledMissions = getMissionsForDate(date, missions);
  return scheduledMissions.some(
    (mission) =>
      mission.commitmentType === 'daily-habit'
  );
};

/**
 * Check if a day has challenges (challenge type or custom frequency)
 */
export const hasChallenges = (date: Date, missions: Mission[]): boolean => {
  const scheduledMissions = getMissionsForDate(date, missions);
  return scheduledMissions.some(
    (mission) =>
      mission.commitmentType === 'challenge'
  );
};

/**
 * Check if a day has To-Dos with deadlines
 */
export const hasTodos = (date: Date, milestones: any[] = []): boolean => {
  const matchedMilestones = milestones.filter((milestone) =>
    doesMilestoneDeadlineMatch(milestone.deadline, date)
  );
  return matchedMilestones.length > 0;
};

/**
 * Determine the status of a day based on its missions and targeted To-Dos
 */
export const getDayStatus = (
  date: Date,
  missions: Mission[],
  milestones: any[] = [],
  history?: any[]
): MissionDayStatus => {
  const scheduledMissions = getMissionsForDate(date, missions);
  const matchedMilestones = milestones.filter((milestone) =>
    doesMilestoneDeadlineMatch(milestone.deadline, date)
  );

  if (scheduledMissions.length === 0 && matchedMilestones.length === 0) {
    return 'normal';
  }

  const completions = scheduledMissions.map((mission) =>
    getMissionCompletionForDate(mission, date, history)
  );

  const missionsCompleted = completions.every(
    (completion) => completion.status === 'completed'
  );

  const milestonesCompleted = matchedMilestones.every(
    (milestone) => milestone.status === 'completed'
  );

  // If it's a past day, if all are completed, return success. Otherwise, it failed!
  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const compareDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const isPast = compareDateOnly < todayDateOnly;

  if (isPast) {
    if (missionsCompleted && milestonesCompleted) {
      return 'success';
    }
    return 'failed';
  }

  const hasFailed = completions.some(
    (completion) => completion.status === 'failed'
  );

  if (hasFailed) {
    return 'failed';
  }

  if (missionsCompleted && milestonesCompleted) {
    return 'success';
  }

  return 'has-missions';
};

/**
 * Get day mission data for a specific date (including matching milestones)
 */
export const getDayMissionData = (
  date: Date,
  missions: Mission[],
  milestones: any[] = [],
  history?: any[]
): DayMissionData => {
  const dateString = toLocalYYYYMMDD(date);
  const scheduledMissions = getMissionsForDate(date, missions);
  const status = getDayStatus(date, missions, milestones, history);

  const dayMissions = scheduledMissions.map((mission) => ({
    mission,
    completion: getMissionCompletionForDate(mission, date, history),
  }));

  const matchedMilestones = milestones.filter((milestone) =>
    doesMilestoneDeadlineMatch(milestone.deadline, date)
  );

  return {
    date: dateString,
    status,
    missions: dayMissions,
    milestones: matchedMilestones,
  };
};

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export const formatDateToISO = (date: Date): string => {
  return toLocalYYYYMMDD(date);
};
