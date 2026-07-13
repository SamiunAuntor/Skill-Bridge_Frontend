import AccountSecuritySettings from "@/Components/Dashboard/AccountSecuritySettings";

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_18px_40px_rgba(0,51,88,0.08)]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
          Admin profile
        </p>
        <h1 className="mt-2 font-headline text-3xl font-extrabold text-primary">
          Profile and security
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-on-surface-variant">
          Manage the security credentials for your SkillBridge administrator account.
        </p>
      </section>
      <AccountSecuritySettings />
    </div>
  );
}
