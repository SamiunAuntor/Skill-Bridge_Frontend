"use client";

import StudentDashboardHome from "@/Components/Dashboard/StudentDashboardHome";
import TutorDashboardHome from "@/Components/Dashboard/TutorDashboardHome";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";
import { useAppAuthSession } from "@/lib/auth";

export default function DashboardPage() {
  const { data: session, isPending } = useAppAuthSession();
  const role = session?.user?.role;

  if (isPending || !role) {
    return <DashboardPageLoader label="Loading dashboard..." />;
  }

  return role === "tutor" ? <TutorDashboardHome /> : <StudentDashboardHome />;
}
