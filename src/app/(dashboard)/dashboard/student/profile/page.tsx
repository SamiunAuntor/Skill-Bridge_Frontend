import StudentProfileSettings from "@/Components/Dashboard/StudentProfileSettings";
import AccountSecuritySettings from "@/Components/Dashboard/AccountSecuritySettings";

export default function StudentDashboardProfilePage() {
  return (
    <div className="space-y-6">
      <StudentProfileSettings />
      <AccountSecuritySettings />
    </div>
  );
}
