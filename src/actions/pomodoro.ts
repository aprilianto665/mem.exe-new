"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId, getUserSettingsAction } from "@/actions/user";
import { resolveHangingTimers } from "@/actions/missions";

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
  } catch {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

export interface PomodoroSessionData {
  id: string;
  missionId: string;
  missionTitle: string;
  phase: "focus" | "rest";
  startTime: string;
  expectedEndTime: string;
  focusMinutes: number;
  restMinutes: number;
  serverNow: string;
}

// Log seconds to mission_daily_progress
async function logSecondsToMission(
  userId: string,
  missionId: string,
  secondsToAdd: number,
  timezone: string
) {
  if (secondsToAdd <= 0) return;

  const todayStr = getLocalDateString(new Date(), timezone);
  const todayDate = new Date(todayStr + "T00:00:00Z");

  const m = await prisma.missions.findUnique({ where: { id: missionId } });
  if (!m || m.user_id !== userId) return;

  await prisma.$transaction(async (tx: any) => {
    const progress = await tx.mission_daily_progress.findUnique({
      where: {
        mission_id_mission_date: {
          mission_id: missionId,
          mission_date: todayDate,
        },
      },
    });

    const currentSecs =
      progress?.seconds_done && progress.seconds_done > 0
        ? progress.seconds_done
        : (progress?.minutes_done ?? 0) * 60;

    const newTotalSeconds = currentSecs + secondsToAdd;
    const finalMinutes = Math.floor(newTotalSeconds / 60);
    const reqMins = progress?.required_minutes ?? m.current_minutes_per_day;
    const status = finalMinutes >= reqMins ? "completed" : "pending";

    await tx.mission_daily_progress.upsert({
      where: {
        mission_id_mission_date: {
          mission_id: missionId,
          mission_date: todayDate,
        },
      },
      update: {
        seconds_done: newTotalSeconds,
        minutes_done: finalMinutes,
        status: status,
        updated_at: new Date(),
      },
      create: {
        mission_id: missionId,
        mission_date: todayDate,
        required_minutes: reqMins,
        seconds_done: newTotalSeconds,
        minutes_done: finalMinutes,
        status: status,
      },
    });
  });
}

export async function getPomodoroStatusAction(): Promise<PomodoroSessionData | null> {
  const userId = await getAuthUserId();
  const settings = await getUserSettingsAction();
  const timezone = settings.timezone;

  await resolveHangingTimers(userId, timezone);

  const session = await prisma.active_pomodoro_sessions.findUnique({
    where: { user_id: userId },
    include: { missions: true },
  });

  if (!session) {
    return null;
  }

  const now = new Date();
  const focusMinutes = settings.pomodoro?.focus_minutes ?? 25;
  const restMinutes = settings.pomodoro?.rest_minutes ?? 5;
  const focusMs = focusMinutes * 60 * 1000;
  const restMs = restMinutes * 60 * 1000;

  const currentExpectedEnd = new Date(session.expected_end_time);

  // If time has elapsed past expected end time, resolve all elapsed cycles seamlessly
  if (now.getTime() >= currentExpectedEnd.getTime()) {
    let phase = session.phase;
    let phaseStart = new Date(session.start_time);
    let phaseEnd = currentExpectedEnd;
    let totalFocusSecondsToLog = 0;

    while (now.getTime() >= phaseEnd.getTime()) {
      if (phase === "focus") {
        totalFocusSecondsToLog += focusMinutes * 60;
        phase = "rest";
        phaseStart = phaseEnd;
        phaseEnd = new Date(phaseStart.getTime() + restMs);
      } else {
        phase = "focus";
        phaseStart = phaseEnd;
        phaseEnd = new Date(phaseStart.getTime() + focusMs);
      }
    }

    if (totalFocusSecondsToLog > 0) {
      await logSecondsToMission(userId, session.mission_id, totalFocusSecondsToLog, timezone);
    }

    const updated = await prisma.active_pomodoro_sessions.update({
      where: { user_id: userId },
      data: {
        phase: phase,
        start_time: phaseStart,
        expected_end_time: phaseEnd,
        updated_at: new Date(),
      },
      include: { missions: true },
    });

    return {
      id: updated.id,
      missionId: updated.mission_id,
      missionTitle: updated.missions.title,
      phase: updated.phase as "focus" | "rest",
      startTime: updated.start_time.toISOString(),
      expectedEndTime: updated.expected_end_time.toISOString(),
      focusMinutes,
      restMinutes,
      serverNow: new Date().toISOString(),
    };
  }

  return {
    id: session.id,
    missionId: session.mission_id,
    missionTitle: session.missions.title,
    phase: session.phase as "focus" | "rest",
    startTime: session.start_time.toISOString(),
    expectedEndTime: session.expected_end_time.toISOString(),
    focusMinutes,
    restMinutes,
    serverNow: new Date().toISOString(),
  };
}

export async function startPomodoroAction(missionId: string): Promise<PomodoroSessionData> {
  const userId = await getAuthUserId();
  const settings = await getUserSettingsAction();
  const timezone = settings.timezone;

  await resolveHangingTimers(userId, timezone);

  const mission = await prisma.missions.findUnique({
    where: { id: missionId },
  });

  if (!mission || mission.user_id !== userId) {
    throw new Error("Mission not found or unauthorized");
  }

  const activeDefaultTimer = await prisma.mission_daily_progress.findFirst({
    where: {
      missions: { user_id: userId },
      timer_started_at: { not: null },
    },
  });
  if (activeDefaultTimer) {
    throw new Error("Please complete or stop your active timer first");
  }

  const focusMinutes = settings.pomodoro?.focus_minutes ?? 25;
  const restMinutes = settings.pomodoro?.rest_minutes ?? 5;
  const now = new Date();
  const expectedEnd = new Date(now.getTime() + focusMinutes * 60 * 1000);

  const session = await prisma.active_pomodoro_sessions.upsert({
    where: { user_id: userId },
    update: {
      mission_id: missionId,
      phase: "focus",
      start_time: now,
      expected_end_time: expectedEnd,
      updated_at: now,
    },
    create: {
      user_id: userId,
      mission_id: missionId,
      phase: "focus",
      start_time: now,
      expected_end_time: expectedEnd,
    },
    include: { missions: true },
  });

  return {
    id: session.id,
    missionId: session.mission_id,
    missionTitle: session.missions.title,
    phase: "focus",
    startTime: session.start_time.toISOString(),
    expectedEndTime: session.expected_end_time.toISOString(),
    focusMinutes,
    restMinutes,
    serverNow: new Date().toISOString(),
  };
}

export async function timerActionAction(payload: {
  action: "finish_phase" | "stop_early" | "skip_rest";
}): Promise<PomodoroSessionData | null> {
  const userId = await getAuthUserId();
  const settings = await getUserSettingsAction();
  const timezone = settings.timezone;

  const session = await prisma.active_pomodoro_sessions.findUnique({
    where: { user_id: userId },
    include: { missions: true },
  });

  if (!session) {
    return null;
  }

  const now = new Date();
  const focusMinutes = settings.pomodoro?.focus_minutes ?? 25;
  const restMinutes = settings.pomodoro?.rest_minutes ?? 5;

  if (payload.action === "finish_phase") {
    if (session.phase === "focus") {
      // 1. Log full focus time
      await logSecondsToMission(userId, session.mission_id, focusMinutes * 60, timezone);

      // 2. Transition to rest phase
      const restEnd = new Date(now.getTime() + restMinutes * 60 * 1000);
      const updated = await prisma.active_pomodoro_sessions.update({
        where: { user_id: userId },
        data: {
          phase: "rest",
          start_time: now,
          expected_end_time: restEnd,
          updated_at: now,
        },
        include: { missions: true },
      });

      return {
        id: updated.id,
        missionId: updated.mission_id,
        missionTitle: updated.missions.title,
        phase: "rest",
        startTime: updated.start_time.toISOString(),
        expectedEndTime: updated.expected_end_time.toISOString(),
        focusMinutes,
        restMinutes,
        serverNow: new Date().toISOString(),
      };
    } else {
      // Rest finished -> Automatically loop to next focus phase!
      const focusEnd = new Date(now.getTime() + focusMinutes * 60 * 1000);
      const updated = await prisma.active_pomodoro_sessions.update({
        where: { user_id: userId },
        data: {
          phase: "focus",
          start_time: now,
          expected_end_time: focusEnd,
          updated_at: now,
        },
        include: { missions: true },
      });

      return {
        id: updated.id,
        missionId: updated.mission_id,
        missionTitle: updated.missions.title,
        phase: "focus",
        startTime: updated.start_time.toISOString(),
        expectedEndTime: updated.expected_end_time.toISOString(),
        focusMinutes,
        restMinutes,
        serverNow: new Date().toISOString(),
      };
    }
  } else if (payload.action === "skip_rest") {
    // Skip rest -> Immediately transition to next focus phase!
    const focusEnd = new Date(now.getTime() + focusMinutes * 60 * 1000);
    const updated = await prisma.active_pomodoro_sessions.update({
      where: { user_id: userId },
      data: {
        phase: "focus",
        start_time: now,
        expected_end_time: focusEnd,
        updated_at: now,
      },
      include: { missions: true },
    });

    return {
      id: updated.id,
      missionId: updated.mission_id,
      missionTitle: updated.missions.title,
      phase: "focus",
      startTime: updated.start_time.toISOString(),
      expectedEndTime: updated.expected_end_time.toISOString(),
      focusMinutes,
      restMinutes,
      serverNow: new Date().toISOString(),
    };
  } else if (payload.action === "stop_early") {
    if (session.phase === "focus") {
      // Calculate elapsed seconds since start_time
      const elapsedSecs = Math.min(
        focusMinutes * 60,
        Math.max(0, Math.floor((now.getTime() - session.start_time.getTime()) / 1000))
      );
      if (elapsedSecs > 0) {
        await logSecondsToMission(userId, session.mission_id, elapsedSecs, timezone);
      }
    }
    // Delete session
    await prisma.active_pomodoro_sessions.delete({
      where: { user_id: userId },
    });
    return null;
  }

  return null;
}
