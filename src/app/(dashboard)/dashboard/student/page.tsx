import StudentDashboardHome from "@/Components/Dashboard/StudentDashboardHome";
import { getServerDashboardSessions } from "@/lib/booking-server";

export default async function StudentDashboardPage() {
  const initialSessions = await getServerDashboardSessions();

  return <StudentDashboardHome initialSessions={initialSessions?.sessions ?? []} />;
}
