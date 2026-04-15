import StudentProfileSettings from "@/Components/Dashboard/StudentProfileSettings";
import TutorProfileSettings from "@/Components/Dashboard/TutorProfileSettings";

export default function DashboardProfilePage() {
  return (
    <>
      <TutorProfileSettings />
      <StudentProfileSettings />
    </>
  );
}
