"use client";

import Link from "next/link";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-secondary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </header>
  );
}

export function AdminStatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number | string;
  href?: string;
}) {
  const content = (
    <div className="rounded-[1.4rem] bg-surface-container-lowest p-6 shadow-[0px_12px_28px_rgba(0,51,88,0.05)] transition-all hover:-translate-y-0.5">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-3 font-headline text-4xl font-black text-primary">{value}</p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function AdminCard({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] bg-surface-container-low p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.05)]">
      {title ? (
        <h2 className="mb-5 font-headline text-xl font-bold text-primary">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

export function AdminTableEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-lowest px-5 py-8 text-center">
      <h3 className="font-headline text-xl font-bold text-primary">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
        {description}
      </p>
    </div>
  );
}

export function AdminLoadingMessage({ label }: { label: string }) {
  return <DashboardPageLoader label={label} />;
}

export function AdminErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-2xl bg-error-container px-5 py-4 text-sm text-on-error-container">
      {message}
    </div>
  );
}

export function AdminPaginationControls({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-4">
      <p className="text-sm text-on-surface-variant">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
