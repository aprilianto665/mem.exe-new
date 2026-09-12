import { Settings } from "./SettingsContent";
import { fetchDailyMissionsAction } from "@/features/missions/actions/missions";
import { getPomodoroStatusAction } from "@/features/pomodoro/actions/pomodoro";
import { StoreInitializer } from "@/components/providers/StoreInitializer";
import { mapBackendMissions, mapBackendHistory } from "@/features/missions/store/missionStore";

export async function SettingsView() {
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
