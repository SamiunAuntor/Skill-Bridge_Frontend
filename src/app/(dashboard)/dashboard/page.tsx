import StudentDashboardHome from "@/Components/Dashboard/StudentDashboardHome";
import TutorDashboardHome from "@/Components/Dashboard/TutorDashboardHome";

export default function DashboardPage() {
  return (
    <>
      <TutorDashboardHome />
      <StudentDashboardHome />
    </>
  );
}
