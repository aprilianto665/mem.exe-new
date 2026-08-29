export const dynamic = "force-dynamic";

import { Settings } from "@/views/Settings/Settings";
import { fetchDailyMissionsAction } from "@/actions/missions";
import { getPomodoroStatusAction } from "@/actions/pomodoro";
import { StoreInitializer } from "@/components/providers/StoreInitializer";
import { mapBackendMissions, mapBackendHistory } from "@/store/missionStore";

export default async function SettingsPage() {
  const [missionsRes, pomodoroData] = await Promise.all([
    fetchDailyMissionsAction().catch((err) => {
      console.error("Failed to fetch daily missions on server for settings:", err);
      return { data: [], history: [] };
    }),
    getPomodoroStatusAction().catch((err) => {
      console.error("Failed to fetch pomodoro status on server for settings:", err);
      return null;
    }),
  ]);

  const missions = mapBackendMissions(missionsRes?.data || []);
  const history = mapBackendHistory(missionsRes?.history || []);

  return (
    <>
      <StoreInitializer
        missions={missions}
        history={history}
        pomodoroSession={pomodoroData}
      />
      <Settings />
    </>
  );
}
