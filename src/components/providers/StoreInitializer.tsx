"use client";

import { useRef } from "react";
import { useMissionStore, type DailyProgress, type Milestone } from "@/features/missions/store/missionStore";
import { usePomodoroStore } from "@/features/pomodoro/store/pomodoroStore";
import type { Mission } from "@/features/missions/types/mission.types";
import type { PomodoroSessionData } from "@/features/pomodoro/services/pomodoroService";

interface StoreInitializerProps {
  missions?: Mission[];
  history?: DailyProgress[];
  pomodoroSession?: PomodoroSessionData | null;
  milestones?: Milestone[];
}

export function StoreInitializer({
  missions,
  history,
  pomodoroSession,
  milestones,
}: StoreInitializerProps) {
  const initialized = useRef(false);

  if (!initialized.current) {
    if (missions) {
      useMissionStore.getState().setInitialData(missions, history || []);
    }
    if (pomodoroSession !== undefined) {
      usePomodoroStore.getState().setInitialSession(pomodoroSession);
    }
    if (milestones) {
      useMissionStore.getState().setInitialMilestones(milestones);
    }
    initialized.current = true;
  }

  return null;
}
