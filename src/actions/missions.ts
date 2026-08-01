"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId, getUserSettingsAction } from "@/actions/user";
import {
  mission_type,
  mission_status_type,
  missions as prisma_missions,
  mission_daily_progress as prisma_mission_daily_progress,
  milestones as prisma_milestones,
} from "@prisma/client";

// Helper: Format Date to YYYY-MM-DD in the specified timezone
function getLocalDateString(date: Date, tz: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(date);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    return `${year}-${month}-${day}`;
  } catch (e) {
    // Fallback if invalid timezone
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

// Helper to determine if a mission is active and scheduled on a target date
function isMissionScheduledInTS(
  startDate: Date | null,
  daysOfWeek: number[],
  type: string,
  targetDays: number | null,
  checkDate: Date,
  timezone: string
): boolean {
  if (!startDate) return false;

  const checkStr = getLocalDateString(checkDate, timezone);
  const startStr = getLocalDateString(startDate, timezone);

  if (checkStr < startStr) return false;
  if (type === "daily_habit") return true;

  // Find weekday of checkDate in user timezone
  let localDate: Date;
  try {
    localDate = new Date(checkDate.toLocaleString("en-US", { timeZone: timezone }));
  } catch (e) {
    localDate = new Date(checkDate);
  }
  const dayOfWeek = localDate.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday

  if (daysOfWeek && daysOfWeek.length > 0) {
    if (daysOfWeek.length === 7) return true;
    return daysOfWeek.includes(dayOfWeek);
  }

  return true;
}

function getMissionCompletionDateTS(
  missionId: string,
  type: string,
  targetDays: number | null,
  history: prisma_mission_daily_progress[],
  timezone: string
): Date | null {
  const completedHistory = history
    .filter(
      (h) =>
        h.mission_id === missionId &&
        (h.status === "completed" || h.minutes_done >= h.required_minutes)
    )
    .sort((a, b) => new Date(a.mission_date).getTime() - new Date(b.mission_date).getTime());

  if (completedHistory.length === 0) return null;

  if (type === "challenge" && targetDays !== null && targetDays > 0) {
    if (completedHistory.length >= targetDays) {
      return new Date(completedHistory[targetDays - 1].mission_date);
    }
  }

  return new Date(completedHistory[completedHistory.length - 1].mission_date);
}

function getProjectedEndDateTS(
  todayDate: Date,
  daysOfWeek: number[],
  remainingDays: number,
  timezone: string
): Date {
  let count = 0;
  const curr = new Date(todayDate);
  let lastActiveDate = new Date(todayDate);

  for (let i = 0; i < 5 * 365; i++) {
    const isSched = isMissionScheduledInTS(
      todayDate,
      daysOfWeek,
      "challenge",
      null,
      curr,
      timezone
    );

    if (isSched) {
      count++;
      lastActiveDate = new Date(curr);
      if (count === remainingDays) {
        break;
      }
    }
    curr.setDate(curr.getDate() + 1);
  }

  return lastActiveDate;
}

// Helper to check if a mission is scheduled, incorporating challenges completed-limit logic
function isMissionScheduledUsecaseTS(
  status: string,
  missionId: string,
  startDate: Date | null,
  daysOfWeek: number[],
  type: string,
  targetDays: number | null,
  checkDate: Date,
  todayDateOnly: Date,
  history: prisma_mission_daily_progress[],
  timezone: string
): boolean {
  if (status === "cancelled") return false;
  if (!startDate) return false;

  const checkStr = getLocalDateString(checkDate, timezone);
  const startStr = getLocalDateString(startDate, timezone);
  if (checkStr < startStr) return false;

  const completedDaysCount = history.filter(
    (h) =>
      h.mission_id === missionId &&
      (h.status === "completed" || h.minutes_done >= h.required_minutes)
  ).length;

  const effectiveStatus = checkAndUpdateMissionStatus(
    missionId,
    status,
    type,
    targetDays,
    completedDaysCount
  );

  if (effectiveStatus === "completed") {
    const completionDate = getMissionCompletionDateTS(
      missionId,
      type,
      targetDays,
      history,
      timezone
    );
    if (completionDate) {
      const completionStr = getLocalDateString(completionDate, timezone);
      if (checkStr > completionStr) {
        return false;
      }
    }
  } else if (type === "challenge" && targetDays !== null && targetDays > 0) {
    const todayStr = getLocalDateString(todayDateOnly, timezone);
    if (checkStr > todayStr) {
      const remainingDays = Math.max(1, targetDays - completedDaysCount);
      const projectedEndDate = getProjectedEndDateTS(
        todayDateOnly,
        daysOfWeek,
        remainingDays,
        timezone
      );
      const projectedEndStr = getLocalDateString(projectedEndDate, timezone);
      if (checkStr > projectedEndStr) {
        return false;
      }
    }
  }

  const isSchedOnCheckDate = isMissionScheduledInTS(
    startDate,
    daysOfWeek,
    type,
    targetDays,
    checkDate,
    timezone
  );
  if (!isSchedOnCheckDate) return false;

  return true;
}

// Helper to compute active streak and consecutive missed days
function computeStreakAndMissedTS(
  missionId: string,
  startDate: Date | null,
  daysOfWeek: number[],
  type: string,
  targetDays: number | null,
  history: prisma_mission_daily_progress[],
  targetDate: Date,
  timezone: string,
  status?: string
): [number, number] {
  const progressMap = new Map<string, prisma_mission_daily_progress>();
  const completedHistory: prisma_mission_daily_progress[] = [];

  for (const h of history) {
    if (h.mission_id === missionId) {
      progressMap.set(getLocalDateString(h.mission_date, timezone), h);
      if (h.status === "completed" || h.minutes_done >= h.required_minutes) {
        completedHistory.push(h);
      }
    }
  }

  let effectiveTargetDate = targetDate;

  const completedDaysCount = completedHistory.length;
  const isCompletedMission =
    status === "completed" ||
    (type === "challenge" && targetDays !== null && completedDaysCount >= targetDays);

  if (isCompletedMission) {
    let compDate: Date | null = null;
    completedHistory.sort(
      (a, b) => new Date(a.mission_date).getTime() - new Date(b.mission_date).getTime()
    );
    if (type === "challenge" && targetDays !== null && targetDays > 0 && completedHistory.length >= targetDays) {
      compDate = new Date(completedHistory[targetDays - 1].mission_date);
    } else if (completedHistory.length > 0) {
      compDate = new Date(completedHistory[completedHistory.length - 1].mission_date);
    }

    if (compDate) {
      const compStr = getLocalDateString(compDate, timezone);
      const targetStr = getLocalDateString(targetDate, timezone);
      if (compStr < targetStr) {
        effectiveTargetDate = compDate;
      }
    }
  }

  let streak = 0;
  let curr = new Date(effectiveTargetDate);
  let streakBroken = false;
  const startStr = startDate ? getLocalDateString(startDate, timezone) : "";

  while (!streakBroken) {
    if (startDate) {
      const currStr = getLocalDateString(curr, timezone);
      if (currStr < startStr) {
        break;
      }
    }

    if (isMissionScheduledInTS(startDate, daysOfWeek, type, targetDays, curr, timezone)) {
      const currStr = getLocalDateString(curr, timezone);
      const record = progressMap.get(currStr);
      const targetStr = getLocalDateString(effectiveTargetDate, timezone);

      if (currStr === targetStr) {
        if (record) {
          const isCompleted =
            record.status === "completed" || record.minutes_done >= record.required_minutes;
          if (isCompleted) {
            streak++;
          }
        }
      } else {
        if (record && (record.status === "completed" || record.minutes_done >= record.required_minutes)) {
          streak++;
        } else {
          streakBroken = true;
        }
      }
    }
    curr.setDate(curr.getDate() - 1);
  }

  let totalMissed = 0;
  if (startDate) {
    const todayStr = getLocalDateString(new Date(), timezone);
    curr = new Date(effectiveTargetDate);
    curr.setDate(curr.getDate() - 1); // Start from yesterday relative to effectiveTargetDate

    while (true) {
      const currStr = getLocalDateString(curr, timezone);
      if (currStr < startStr) {
        break;
      }

      if (currStr < todayStr && isMissionScheduledInTS(startDate, daysOfWeek, type, targetDays, curr, timezone)) {
        const record = progressMap.get(currStr);
        const isCompleted =
          record && (record.status === "completed" || record.minutes_done >= record.required_minutes);
        if (!isCompleted) {
          totalMissed++;
        }
      }
      curr.setDate(curr.getDate() - 1);
    }
  }

  return [streak, totalMissed];
}

// Helper to compute the current day of a mission
function calculateCurrentDayTS(
  missionId: string,
  startDate: Date | null,
  daysOfWeek: number[],
  type: string,
  targetDays: number | null,
  history: prisma_mission_daily_progress[],
  targetDate: Date,
  timezone: string,
  status?: string
): number {
  if (!startDate) return 1;

  const scheduledDays = countScheduledDaysTS(startDate, daysOfWeek, type, targetDays, targetDate, timezone);
  const [_, totalMissed] = computeStreakAndMissedTS(
    missionId,
    startDate,
    daysOfWeek,
    type,
    targetDays,
    history,
    targetDate,
    timezone,
    status
  );

  let currentDay = scheduledDays - totalMissed;
  if (currentDay < 1) {
    currentDay = 1;
  }

  if (targetDays !== null) {
    if (currentDay > targetDays) {
      currentDay = targetDays;
    }
  }

  return currentDay;
}

function countScheduledDaysTS(
  startDate: Date | null,
  daysOfWeek: number[],
  type: string,
  targetDays: number | null,
  targetDate: Date,
  timezone: string
): number {
  if (!startDate) return 0;

  const startStr = getLocalDateString(startDate, timezone);
  const targetStr = getLocalDateString(targetDate, timezone);

  if (targetStr < startStr) return 0;

  let count = 0;
  const curr = new Date(startDate);
  const targetTime = targetDate.getTime();

  while (curr.getTime() <= targetTime) {
    if (isMissionScheduledInTS(startDate, daysOfWeek, type, targetDays, curr, timezone)) {
      count++;
    }
    curr.setDate(curr.getDate() + 1);
  }
  return count;
}

function checkAndUpdateMissionStatus(
  missionId: string,
  status: string,
  type: string,
  targetDays: number | null,
  completedDays: number
): string {
  if (
    status === "active" &&
    type === "challenge" &&
    targetDays !== null &&
    completedDays >= targetDays
  ) {
    // Update status in background asynchronously (or in a transaction if needed)
    void prisma.missions.update({
      where: { id: missionId },
      data: { status: "completed" },
    });
    return "completed";
  }
  return status;
}

function getMissionCompletionStatus(
  status: string,
  missionId: string,
  dateStr: string,
  historyMap: Map<string, { minutes_done: number; required_minutes: number; status: string }>,
  isPast: boolean,
  isToday: boolean
): string {
  const key = `${missionId}_${dateStr}`;
  const record = historyMap.get(key);

  if (isToday) {
    if (record) {
      if (record.status === "completed" || record.minutes_done >= record.required_minutes) {
        return "completed";
      }
    }
    return "pending";
  }
  if (!isPast) {
    return "pending";
  }
  if (record) {
    if (record.status === "completed" || record.minutes_done >= record.required_minutes) {
      return "completed";
    }
  }
  return "failed";
}

function getDayStatusGo(
  scheduledMissions: prisma_missions[],
  historyMap: Map<string, { minutes_done: number; required_minutes: number; status: string }>,
  milestones: prisma_milestones[],
  d: Date,
  timezone: string
): string {
  const dateStr = getLocalDateString(d, timezone);
  const now = new Date();
  const todayStr = getLocalDateString(now, timezone);

  const matchedMilestones = milestones.filter((m: prisma_milestones) => {
    if (!m.deadline) return false;
    return getLocalDateString(new Date(m.deadline), timezone) === dateStr;
  });

  if (scheduledMissions.length === 0 && matchedMilestones.length === 0) {
    return "normal";
  }

  const isPast = dateStr < todayStr;
  const isToday = dateStr === todayStr;

  let missionsCompleted = true;
  let hasFailed = false;

  for (const m of scheduledMissions) {
    const compStatus = getMissionCompletionStatus(
      m.status,
      m.id,
      dateStr,
      historyMap,
      isPast,
      isToday
    );
    if (compStatus !== "completed") {
      missionsCompleted = false;
    }
    if (compStatus === "failed") {
      hasFailed = true;
    }
  }

  let milestonesCompleted = true;
  for (const m of matchedMilestones) {
    if (m.status !== "completed") {
      milestonesCompleted = false;
    }
  }

  if (isPast) {
    if (missionsCompleted && milestonesCompleted) {
      return "success";
    }
    return "failed";
  }

  if (hasFailed) {
    return "failed";
  }

  if (missionsCompleted && milestonesCompleted) {
    return "success";
  }

  return "has-missions";
}

// SERVER ACTIONS BELOW

export async function fetchMissionsAction(
  filters?: {
    commitmentType?: string;
    status?: string;
    search?: string;
  },
  timezoneArg?: string
) {
  const userId = await getAuthUserId();
  const settings = await getUserSettingsAction();
  const timezone = timezoneArg || settings.timezone;

  const todayStr = getLocalDateString(new Date(), timezone);
  const todayDate = new Date(todayStr + "T00:00:00Z");

  const whereClause: any = { user_id: userId };

  if (filters?.commitmentType && filters.commitmentType !== "all") {
    whereClause.type = filters.commitmentType as mission_type;
  }

  if (filters?.search && filters.search.trim() !== "") {
    whereClause.title = {
      contains: filters.search.trim(),
      mode: "insensitive",
    };
  }

  const rawMissions = await prisma.missions.findMany({
    where: whereClause,
    include: {
      mission_daily_progress: {
        where: { mission_date: todayDate },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const historyRows = await prisma.mission_daily_progress.findMany({
    where: {
      missions: { user_id: userId },
    },
    orderBy: { mission_date: "desc" },
  });

  const mappedMissions = rawMissions.map((m: any) => {
    const progressToday = m.mission_daily_progress[0];
    const completedDaysCount = historyRows.filter(
      (h: prisma_mission_daily_progress) =>
        h.mission_id === m.id &&
        (h.status === "completed" || h.minutes_done >= h.required_minutes)
    ).length;

    const status = checkAndUpdateMissionStatus(
      m.id,
      m.status,
      m.type,
      m.target_days,
      completedDaysCount
    );

    const currentDay = calculateCurrentDayTS(
      m.id,
      m.start_date,
      m.days_of_week,
      m.type,
      m.target_days,
      historyRows,
      todayDate,
      timezone,
      status
    );

    const [streak, missedConsecutive] = computeStreakAndMissedTS(
      m.id,
      m.start_date,
      m.days_of_week,
      m.type,
      m.target_days,
      historyRows,
      todayDate,
      timezone,
      status
    );

    return {
      id: m.id,
      title: m.title,
      description: m.description,
      type: m.type,
      status: status,
      current_day: currentDay,
      target_day: m.target_days ?? 0,
      minutes_per_day: m.current_minutes_per_day,
      timer_started_at: progressToday?.timer_started_at?.toISOString() || null,
      logged_minutes: progressToday?.minutes_done ?? 0,
      start_date: m.start_date ? m.start_date.toISOString() : null,
      days_of_week: m.days_of_week,
      duration: m.target_days ?? 0,
      streak,
      missed_consecutive: missedConsecutive,
    };
  });

  let finalMissions = mappedMissions;
  if (filters?.status && filters.status !== "all") {
    finalMissions = mappedMissions.filter(
      (m) => m.status === filters.status
    );
  }

  const history = historyRows.map((h: prisma_mission_daily_progress) => ({
    mission_id: h.mission_id,
    date: getLocalDateString(h.mission_date, timezone),
    minutes_done: h.minutes_done,
    required_minutes: h.required_minutes,
    status: h.status,
  }));

  return { data: finalMissions, history };
}

export async function fetchDailyMissionsAction(timezoneArg?: string) {
  const userId = await getAuthUserId();
  const settings = await getUserSettingsAction();
  const timezone = timezoneArg || settings.timezone;

  const todayStr = getLocalDateString(new Date(), timezone);
  const todayDate = new Date(todayStr + "T00:00:00Z");

  const rawMissions = await prisma.missions.findMany({
    where: { user_id: userId },
    include: {
      mission_daily_progress: {
        where: { mission_date: todayDate },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const historyRows = await prisma.mission_daily_progress.findMany({
    where: { missions: { user_id: userId } },
    orderBy: { mission_date: "desc" },
  });

  const missions: any[] = [];
  const history: any[] = [];

  for (const m of rawMissions) {
    const completedDaysCount = historyRows.filter(
      (h: prisma_mission_daily_progress) =>
        h.mission_id === m.id &&
        (h.status === "completed" || h.minutes_done >= h.required_minutes)
    ).length;

    const status = checkAndUpdateMissionStatus(
      m.id,
      m.status,
      m.type,
      m.target_days,
      completedDaysCount
    );

    if (status !== "active") continue;

    if (
      !isMissionScheduledUsecaseTS(
        status,
        m.id,
        m.start_date,
        m.days_of_week,
        m.type,
        m.target_days,
        todayDate,
        todayDate,
        historyRows,
        timezone
      )
    ) {
      continue;
    }

    const currentDay = calculateCurrentDayTS(
      m.id,
      m.start_date,
      m.days_of_week,
      m.type,
      m.target_days,
      historyRows,
      todayDate,
      timezone,
      status
    );

    const [streak, missedConsecutive] = computeStreakAndMissedTS(
      m.id,
      m.start_date,
      m.days_of_week,
      m.type,
      m.target_days,
      historyRows,
      todayDate,
      timezone,
      status
    );

    const progressToday = m.mission_daily_progress[0];

    missions.push({
      id: m.id,
      title: m.title,
      description: m.description,
      type: m.type,
      status: status,
      current_day: currentDay,
      target_day: m.target_days ?? 0,
      minutes_per_day: m.current_minutes_per_day,
      timer_started_at: progressToday?.timer_started_at?.toISOString() || null,
      logged_minutes: progressToday?.minutes_done ?? 0,
      start_date: m.start_date ? m.start_date.toISOString() : null,
      days_of_week: m.days_of_week,
      duration: m.target_days ?? 0,
      streak,
      missed_consecutive: missedConsecutive,
    });

    if (progressToday) {
      history.push({
        mission_id: progressToday.mission_id,
        date: todayStr,
        minutes_done: progressToday.minutes_done,
        required_minutes: progressToday.required_minutes,
        status: progressToday.status,
      });
    } else {
      history.push({
        mission_id: m.id,
        date: todayStr,
        minutes_done: 0,
        required_minutes: m.current_minutes_per_day,
        status: "pending",
      });
    }
  }

  return { data: missions, history };
}

export async function fetchMissionDetailAction(missionId: string, timezoneArg?: string) {
  const userId = await getAuthUserId();
  const settings = await getUserSettingsAction();
  const timezone = timezoneArg || settings.timezone;

  const todayStr = getLocalDateString(new Date(), timezone);
  const todayDate = new Date(todayStr + "T00:00:00Z");

  const m = await prisma.missions.findUnique({
    where: { id: missionId },
    include: {
      mission_daily_progress: {
        where: { mission_date: todayDate },
      },
    },
  });

  if (!m || m.user_id !== userId) {
    throw new Error("Mission not found");
  }

  const historyRows = await prisma.mission_daily_progress.findMany({
    where: { mission_id: missionId },
    orderBy: { mission_date: "desc" },
  });

  const completedDaysCount = historyRows.filter(
    (h: prisma_mission_daily_progress) => h.status === "completed" || h.minutes_done >= h.required_minutes
  ).length;

  const status = checkAndUpdateMissionStatus(
    m.id,
    m.status,
    m.type,
    m.target_days,
    completedDaysCount
  );

  const currentDay = calculateCurrentDayTS(
    m.id,
    m.start_date,
    m.days_of_week,
    m.type,
    m.target_days,
    historyRows,
    todayDate,
    timezone,
    status
  );

  const [streak, missedConsecutive] = computeStreakAndMissedTS(
    m.id,
    m.start_date,
    m.days_of_week,
    m.type,
    m.target_days,
    historyRows,
    todayDate,
    timezone,
    status
  );

  // Stats recalculation cache logic
  let totalMins = m.total_minutes_done ?? 0;
  let avgMins = m.average_minutes_done ?? 0;
  let shouldRecalculate = true;

  if (m.last_stats_calc_date) {
    if (getLocalDateString(m.last_stats_calc_date, timezone) === todayStr) {
      shouldRecalculate = false;
    }
  }

  if (shouldRecalculate) {
    const stats = await prisma.mission_daily_progress.aggregate({
      where: { mission_id: missionId },
      _sum: { minutes_done: true },
      _avg: { minutes_done: true },
    });
    totalMins = stats._sum.minutes_done ?? 0;
    avgMins = stats._avg.minutes_done ? Math.round(stats._avg.minutes_done) : 0;

    await prisma.missions.update({
      where: { id: missionId },
      data: {
        total_minutes_done: totalMins,
        average_minutes_done: avgMins,
        last_stats_calc_date: todayDate,
      },
    });
  }

  const progressToday = m.mission_daily_progress[0];

  return {
    id: m.id,
    title: m.title,
    description: m.description || "",
    type: m.type,
    status: status,
    current_day: currentDay,
    target_day: m.target_days ?? 0,
    minutes_per_day: m.current_minutes_per_day,
    timer_started_at: progressToday?.timer_started_at?.toISOString() || null,
    logged_minutes: progressToday?.minutes_done ?? 0,
    start_date: m.start_date ? m.start_date.toISOString() : null,
    days_of_week: m.days_of_week,
    duration: m.target_days ?? 0,
    streak,
    missed_consecutive: missedConsecutive,
    total_minutes_done: totalMins,
    average_minutes_done: avgMins,
  };
}

export async function addMissionAction(payload: {
  title: string;
  description?: string;
  type: mission_type;
  days_of_week: number[];
  duration?: number;
  minutes_per_day: number;
}) {
  const userId = await getAuthUserId();

  if (payload.title.trim() === "" || payload.title.length > 255) {
    throw new Error("Invalid title");
  }
  if (payload.type === "challenge" && (!payload.duration || payload.duration <= 0)) {
    throw new Error("Duration is required for challenge");
  }
  if (payload.minutes_per_day <= 0) {
    throw new Error("Minutes per day must be greater than zero");
  }
  if (!payload.days_of_week || payload.days_of_week.length === 0) {
    throw new Error("At least one day of the week must be selected");
  }

  const mission = await prisma.missions.create({
    data: {
      user_id: userId,
      title: payload.title,
      description: payload.description,
      type: payload.type,
      base_minutes_per_day: payload.minutes_per_day,
      current_minutes_per_day: payload.minutes_per_day,
      target_days: payload.duration || null,
      days_of_week: payload.days_of_week,
      status: "active",
      start_date: new Date(),
    },
  });

  return { id: mission.id };
}

export async function deleteMissionAction(id: string) {
  const userId = await getAuthUserId();

  const m = await prisma.missions.findUnique({ where: { id } });
  if (!m || m.user_id !== userId) {
    throw new Error("Unauthorized or mission not found");
  }

  await prisma.missions.update({
    where: { id },
    data: { status: "cancelled" },
  });

  return { status: "success" };
}

export async function startTimerAction(id: string, timezoneArg?: string) {
  const userId = await getAuthUserId();
  const settings = await getUserSettingsAction();
  const timezone = timezoneArg || settings.timezone;

  const todayStr = getLocalDateString(new Date(), timezone);
  const todayDate = new Date(todayStr + "T00:00:00Z");

  const m = await prisma.missions.findUnique({ where: { id } });
  if (!m || m.user_id !== userId) {
    throw new Error("Unauthorized or mission not found");
  }

  await prisma.$transaction(async (tx: any) => {
    // Ensure daily progress row exists
    await tx.mission_daily_progress.upsert({
      where: {
        mission_id_mission_date: {
          mission_id: id,
          mission_date: todayDate,
        },
      },
      update: {
        timer_started_at: new Date(),
        updated_at: new Date(),
      },
      create: {
        mission_id: id,
        mission_date: todayDate,
        required_minutes: m.current_minutes_per_day,
        minutes_done: 0,
        timer_started_at: new Date(),
        status: "pending",
      },
    });
  });

  return { status: "success" };
}

export async function logMinutesAction(
  id: string,
  minutes: number,
  timezoneArg?: string
) {
  const userId = await getAuthUserId();
  const settings = await getUserSettingsAction();
  const timezone = timezoneArg || settings.timezone;

  const todayStr = getLocalDateString(new Date(), timezone);
  const todayDate = new Date(todayStr + "T00:00:00Z");

  const m = await prisma.missions.findUnique({ where: { id } });
  if (!m || m.user_id !== userId) {
    throw new Error("Unauthorized or mission not found");
  }

  await prisma.$transaction(async (tx: any) => {
    const existing = await tx.mission_daily_progress.findUnique({
      where: {
        mission_id_mission_date: {
          mission_id: id,
          mission_date: todayDate,
        },
      },
    });

    const finalMinutes = (existing?.minutes_done ?? 0) + minutes;
    const reqMins = existing?.required_minutes ?? m.current_minutes_per_day;
    const status = finalMinutes >= reqMins ? "completed" : "pending";

    await tx.mission_daily_progress.upsert({
      where: {
        mission_id_mission_date: {
          mission_id: id,
          mission_date: todayDate,
        },
      },
      update: {
        minutes_done: { increment: minutes },
        status: status,
        timer_started_at: null,
        updated_at: new Date(),
      },
      create: {
        mission_id: id,
        mission_date: todayDate,
        required_minutes: reqMins,
        minutes_done: minutes,
        status: status,
        timer_started_at: null,
      },
    });
  });

  return { status: "success" };
}

export async function pauseTimerAction(
  id: string,
  additionalMinutes: number,
  timezoneArg?: string
) {
  return await logMinutesAction(id, additionalMinutes, timezoneArg);
}

export async function fetchTimelineDataAction(timezoneArg?: string) {
  const userId = await getAuthUserId();
  const settings = await getUserSettingsAction();
  const timezone = timezoneArg || settings.timezone;

  const todayStr = getLocalDateString(new Date(), timezone);
  const todayDate = new Date(todayStr + "T00:00:00Z");

  const rawMissions = await prisma.missions.findMany({
    where: { user_id: userId },
    include: {
      mission_daily_progress: {
        where: { mission_date: todayDate },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const historyRows = await prisma.mission_daily_progress.findMany({
    where: { missions: { user_id: userId } },
    orderBy: { mission_date: "desc" },
  });

  const milestones = await prisma.milestones.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });

  const missions = rawMissions.map((m: any) => {
    const progressToday = m.mission_daily_progress[0];
    const completedDaysCount = historyRows.filter(
      (h: prisma_mission_daily_progress) =>
        h.mission_id === m.id &&
        (h.status === "completed" || h.minutes_done >= h.required_minutes)
    ).length;

    const status = checkAndUpdateMissionStatus(
      m.id,
      m.status,
      m.type,
      m.target_days,
      completedDaysCount
    );

    const currentDay = calculateCurrentDayTS(
      m.id,
      m.start_date,
      m.days_of_week,
      m.type,
      m.target_days,
      historyRows,
      todayDate,
      timezone,
      status
    );

    const [streak, missedConsecutive] = computeStreakAndMissedTS(
      m.id,
      m.start_date,
      m.days_of_week,
      m.type,
      m.target_days,
      historyRows,
      todayDate,
      timezone,
      status
    );

    return {
      id: m.id,
      title: m.title,
      description: m.description,
      type: m.type,
      status: status,
      current_day: currentDay,
      target_day: m.target_days ?? 0,
      minutes_per_day: m.current_minutes_per_day,
      timer_started_at: progressToday?.timer_started_at?.toISOString() || null,
      logged_minutes: progressToday?.minutes_done ?? 0,
      start_date: m.start_date ? m.start_date.toISOString() : null,
      days_of_week: m.days_of_week,
      duration: m.target_days ?? 0,
      streak,
      missed_consecutive: missedConsecutive,
    };
  });

  const history = historyRows.map((h: prisma_mission_daily_progress) => ({
    mission_id: h.mission_id,
    date: getLocalDateString(h.mission_date, timezone),
    minutes_done: h.minutes_done,
    required_minutes: h.required_minutes,
    status: h.status,
  }));

  const mappedMilestones = milestones.map((m: prisma_milestones) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    deadline: m.deadline ? m.deadline.toISOString() : null,
    status: m.status,
    created_at: m.created_at.toISOString(),
    completed_at: m.completed_at ? m.completed_at.toISOString() : null,
  }));

  return {
    missions,
    milestones: mappedMilestones,
    history,
  };
}

export async function fetchMonthlyTimelineAction(
  year: number,
  month: number,
  timezoneArg?: string
) {
  const userId = await getAuthUserId();
  const settings = await getUserSettingsAction();
  const timezone = timezoneArg || settings.timezone;

  const now = new Date();
  const todayStr = getLocalDateString(now, timezone);
  const todayDateOnly = new Date(todayStr + "T00:00:00Z");

  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const rangeStart = new Date(firstDay);
  rangeStart.setUTCDate(rangeStart.getUTCDate() - 7);
  const rangeEnd = new Date(firstDay);
  rangeEnd.setUTCMonth(rangeEnd.getUTCMonth() + 1);
  rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 6);

  const rawMissions = await prisma.missions.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });

  const historyRows = await prisma.mission_daily_progress.findMany({
    where: { missions: { user_id: userId } },
  });

  const historyMap = new Map<string, prisma_mission_daily_progress>();
  for (const h of historyRows) {
    const dStr = getLocalDateString(h.mission_date, timezone);
    historyMap.set(`${h.mission_id}_${dStr}`, h);
  }

  const milestones = await prisma.milestones.findMany({
    where: { user_id: userId },
  });

  const days: any[] = [];
  const curr = new Date(rangeStart);

  while (curr.getTime() <= rangeEnd.getTime()) {
    const dateStr = getLocalDateString(curr, timezone);
    const scheduled: prisma_missions[] = [];
    let hasHabits = false;
    let hasChallenges = false;

    for (const m of rawMissions) {
      if (
        isMissionScheduledUsecaseTS(
          m.status,
          m.id,
          m.start_date,
          m.days_of_week,
          m.type,
          m.target_days,
          curr,
          todayDateOnly,
          historyRows,
          timezone
        )
      ) {
        scheduled.push(m);
        if (m.type === "daily_habit") {
          hasHabits = true;
        } else {
          hasChallenges = true;
        }
      }
    }

    const hasTodos = milestones.some((m: prisma_milestones) => {
      if (!m.deadline) return false;
      return getLocalDateString(new Date(m.deadline), timezone) === dateStr;
    });

    const status = getDayStatusGo(scheduled, historyMap, milestones, curr, timezone);

    days.push({
      date: dateStr,
      status: status,
      has_habits: hasHabits,
      has_challenges: hasChallenges,
      has_todos: hasTodos,
    });

    curr.setUTCDate(curr.getUTCDate() + 1);
  }

  return days;
}

export async function fetchDailyTimelineAction(dateStr: string, timezoneArg?: string) {
  const userId = await getAuthUserId();
  const settings = await getUserSettingsAction();
  const timezone = timezoneArg || settings.timezone;

  const now = new Date();
  const todayStr = getLocalDateString(now, timezone);
  const todayDateOnly = new Date(todayStr + "T00:00:00Z");

  const targetDate = new Date(dateStr + "T00:00:00Z");
  const isPast = dateStr < todayStr;

  const rawMissions = await prisma.missions.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });

  const historyRows = await prisma.mission_daily_progress.findMany({
    where: { missions: { user_id: userId } },
  });

  const historyMap = new Map<string, prisma_mission_daily_progress>();
  for (const h of historyRows) {
    const dStr = getLocalDateString(h.mission_date, timezone);
    historyMap.set(`${h.mission_id}_${dStr}`, h);
  }

  const milestones = await prisma.milestones.findMany({
    where: { user_id: userId },
  });

  const scheduled: prisma_missions[] = [];
  for (const m of rawMissions) {
    if (
      isMissionScheduledUsecaseTS(
        m.status,
        m.id,
        m.start_date,
        m.days_of_week,
        m.type,
        m.target_days,
        targetDate,
        todayDateOnly,
        historyRows,
        timezone
      )
    ) {
      scheduled.push(m);
    }
  }

  const dayStatus = getDayStatusGo(scheduled, historyMap, milestones, targetDate, timezone);

  const missionDetails: any[] = [];
  for (const m of scheduled) {
    const completedDaysCount = historyRows.filter(
      (h: prisma_mission_daily_progress) =>
        h.mission_id === m.id &&
        (h.status === "completed" || h.minutes_done >= h.required_minutes)
    ).length;

    const status = checkAndUpdateMissionStatus(
      m.id,
      m.status,
      m.type,
      m.target_days,
      completedDaysCount
    );

    const currentDay = calculateCurrentDayTS(
      m.id,
      m.start_date,
      m.days_of_week,
      m.type,
      m.target_days,
      historyRows,
      targetDate,
      timezone,
      status
    );

    const [streak, missedConsecutive] = computeStreakAndMissedTS(
      m.id,
      m.start_date,
      m.days_of_week,
      m.type,
      m.target_days,
      historyRows,
      targetDate,
      timezone,
      status
    );

    const record = historyMap.get(`${m.id}_${dateStr}`);

    const mappedMission = {
      id: m.id,
      title: m.title,
      description: m.description,
      type: m.type,
      status: m.status,
      current_day: currentDay,
      target_day: m.target_days ?? 0,
      minutes_per_day: m.current_minutes_per_day,
      timer_started_at: record?.timer_started_at?.toISOString() || null,
      logged_minutes: record?.minutes_done ?? 0,
      start_date: m.start_date ? m.start_date.toISOString() : null,
      days_of_week: m.days_of_week,
      duration: m.target_days ?? 0,
      streak,
      missed_consecutive: missedConsecutive,
    };

    let loggedMin = 0;
    let reqMin = m.current_minutes_per_day;
    let compStatus = "pending";

    if (record) {
      loggedMin = record.minutes_done;
      reqMin = record.required_minutes;
      if (record.status === "completed" || record.minutes_done >= record.required_minutes) {
        compStatus = "completed";
      } else if (isPast) {
        compStatus = "failed";
      }
    } else {
      if (isPast) {
        compStatus = "failed";
      }
    }

    const mappedCompletion = {
      mission_id: m.id,
      date: dateStr,
      minutes_done: loggedMin,
      required_minutes: reqMin,
      status: compStatus,
    };

    missionDetails.push({
      mission: mappedMission,
      completion: mappedCompletion,
    });
  }

  const matchedMilestones = milestones
    .filter((m: prisma_milestones) => {
      if (!m.deadline) return false;
      return getLocalDateString(new Date(m.deadline), timezone) === dateStr;
    })
    .map((m: prisma_milestones) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      deadline: m.deadline ? m.deadline.toISOString() : null,
      status: m.status,
      created_at: m.created_at.toISOString(),
      completed_at: m.completed_at ? m.completed_at.toISOString() : null,
    }));

  return {
    date: dateStr,
    status: dayStatus,
    missions: missionDetails,
    milestones: matchedMilestones,
  };
}

export async function fetchPublicDailyMissionsAction(userId: string) {
  let timezone = "Asia/Jakarta";
  try {
    const userSettings = await prisma.user_settings.findUnique({
      where: { user_id: userId },
    });
    if (userSettings?.timezone) {
      timezone = userSettings.timezone;
    }
  } catch (e) {
    // fallback timezone
  }

  const todayStr = getLocalDateString(new Date(), timezone);
  const todayDate = new Date(todayStr + "T00:00:00Z");

  const rawMissions = await prisma.missions.findMany({
    where: { user_id: userId },
    include: {
      mission_daily_progress: {
        where: { mission_date: todayDate },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const historyRows = await prisma.mission_daily_progress.findMany({
    where: { missions: { user_id: userId } },
    orderBy: { mission_date: "desc" },
  });

  const formattedData: any[] = [];

  for (const m of rawMissions) {
    const completedDaysCount = historyRows.filter(
      (h: prisma_mission_daily_progress) =>
        h.mission_id === m.id &&
        (h.status === "completed" || h.minutes_done >= h.required_minutes)
    ).length;

    const status = checkAndUpdateMissionStatus(
      m.id,
      m.status,
      m.type,
      m.target_days,
      completedDaysCount
    );

    if (status !== "active") continue;

    if (
      !isMissionScheduledUsecaseTS(
        status,
        m.id,
        m.start_date,
        m.days_of_week,
        m.type,
        m.target_days,
        todayDate,
        todayDate,
        historyRows,
        timezone
      )
    ) {
      continue;
    }

    const currentDay = calculateCurrentDayTS(
      m.id,
      m.start_date,
      m.days_of_week,
      m.type,
      m.target_days,
      historyRows,
      todayDate,
      timezone,
      status
    );

    const [streak] = computeStreakAndMissedTS(
      m.id,
      m.start_date,
      m.days_of_week,
      m.type,
      m.target_days,
      historyRows,
      todayDate,
      timezone,
      status
    );

    const progressToday = m.mission_daily_progress[0];
    const minutesDone = progressToday ? progressToday.minutes_done : 0;
    const requiredMinutes = progressToday ? progressToday.required_minutes : m.current_minutes_per_day;
    const isCompleted = progressToday
      ? progressToday.status === "completed" || minutesDone >= requiredMinutes
      : false;

    formattedData.push({
      id: m.id,
      title: m.title,
      description: m.description || "",
      type: m.type,
      current_day: currentDay,
      target_days: m.target_days || null,
      target_minutes: requiredMinutes,
      minutes_done: minutesDone,
      progress_percentage: Math.min(
        100,
        Math.round((minutesDone / (requiredMinutes || 1)) * 100)
      ),
      is_completed: isCompleted,
      streak: streak,
    });
  }

  return {
    todayStr,
    formattedData,
  };
}

