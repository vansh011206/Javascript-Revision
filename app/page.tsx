import { listTopics } from "@/lib/topics";
import { DashboardClient } from "@/components/DashboardClient";

// Read the /data folder fresh on every request so newly created files appear.
export const dynamic = "force-dynamic";

export default async function Home() {
  const topics = await listTopics();
  return <DashboardClient initialTopics={topics} />;
}
