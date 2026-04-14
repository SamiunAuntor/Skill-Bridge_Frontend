"use client";

import { authClient } from "@/lib/auth-client";

type DashboardPlaceholderPageProps = {
  title: string;
  description: string;
};

export default function DashboardPlaceholderPage({
  title,
  description,
}: DashboardPlaceholderPageProps) {
  const { data: session } = authClient.useSession();
  const role = session?.user?.role ?? "student";

  return (
    <section className="rounded-[1.5rem] bg-surface-container-low p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
        {role} workspace
      </p>
      <h2 className="mt-3 font-headline text-3xl font-bold text-primary">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-on-surface-variant">{description}</p>
    </section>
  );
}
