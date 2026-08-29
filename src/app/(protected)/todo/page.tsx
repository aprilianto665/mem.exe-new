export const dynamic = "force-dynamic";

import { Todo } from "@/views/Todo/Todo";
import { fetchMilestonesAction } from "@/actions/milestones";
import { StoreInitializer } from "@/components/providers/StoreInitializer";
import { mapBackendMilestones } from "@/store/missionStore";

export default async function TodoPage() {
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
