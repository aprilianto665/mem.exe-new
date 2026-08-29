export const dynamic = "force-dynamic";

import { Home } from "@/views/Home/Home";
import { fetchDailyMissionsAction } from "@/actions/missions";
import { getPomodoroStatusAction } from "@/actions/pomodoro";
import { StoreInitializer } from "@/components/providers/StoreInitializer";
import { mapBackendMissions, mapBackendHistory } from "@/store/missionStore";

export default async function MissionsPage() {
  const [missionsRes, pomodoroData] = await Promise.all([
    fetchDailyMissionsAction().catch((err) => {
      console.error("Failed to fetch daily missions on server:", err);
      return { data: [], history: [] };
    }),
    getPomodoroStatusAction().catch((err) => {
      console.error("Failed to fetch pomodoro status on server:", err);
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
      <Home />
    </>
  );
}
