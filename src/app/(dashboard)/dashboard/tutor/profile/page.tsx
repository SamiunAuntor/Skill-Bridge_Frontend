import TutorProfileSettings from "@/Components/Dashboard/TutorProfileSettings";
import AccountSecuritySettings from "@/Components/Dashboard/AccountSecuritySettings";

export default function TutorDashboardProfilePage() {
  return (
    <div className="space-y-6">
      <TutorProfileSettings />
      <AccountSecuritySettings />
    </div>
  );
}
