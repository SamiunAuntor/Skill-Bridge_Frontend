import TutorDashboardHome from "@/Components/Dashboard/TutorDashboardHome";
import { getServerTutorDashboardSummary } from "@/lib/booking-server";

export default async function TutorDashboardPage() {
  const initialSummary = await getServerTutorDashboardSummary();

  return <TutorDashboardHome initialSummary={initialSummary} />;
}
