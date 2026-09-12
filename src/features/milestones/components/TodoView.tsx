import { Todo } from "./TodoContent";
import { fetchMilestonesAction } from "../actions/milestones";
import { StoreInitializer } from "@/components/providers/StoreInitializer";
import { mapBackendMilestones } from "@/features/missions/store/missionStore";

export async function TodoView() {
  const rawMilestones = await fetchMilestonesAction().catch((err) => {
    console.error("Failed to fetch milestones on server:", err);
    return [];
  });

  const milestones = mapBackendMilestones(rawMilestones);

  return (
    <>
      <StoreInitializer milestones={milestones} />
      <Todo />
    </>
  );
}
