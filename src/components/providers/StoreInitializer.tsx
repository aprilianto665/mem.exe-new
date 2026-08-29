"use client";

import { useRef } from "react";
import { useMissionStore, type DailyProgress } from "@/store/missionStore";
import { usePomodoroStore } from "@/store/pomodoroStore";
import type { Mission } from "@/types/mission.types";
import type { PomodoroSessionData } from "@/services/pomodoroService";

interface StoreInitializerProps {
  missions: Mission[];
  history: DailyProgress[];
  pomodoroSession: PomodoroSessionData | null;
}

export function StoreInitializer({
  missions,
  history,
  pomodoroSession,
}: StoreInitializerProps) {
  const initialized = useRef(false);

  if (!initialized.current) {
    useMissionStore.getState().setInitialData(missions, history);
    usePomodoroStore.getState().setInitialSession(pomodoroSession);
    initialized.current = true;
  }

  return null;
}
