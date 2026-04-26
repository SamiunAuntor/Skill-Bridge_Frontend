"use client";

import Link from "next/link";
import { ChevronDown, X } from "lucide-react";
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
      {action ? <div className="w-full md:w-auto">{action}</div> : null}
    </header>
  );
}

export function AdminStatCard({
  label,
  value,
  href,
  helper,
}: {
  label: string;
  value: number | string;
  href?: string;
  helper?: string;
}) {
  const content = (
    <div className="rounded-[1.4rem] bg-surface-container-lowest p-6 shadow-[0px_12px_28px_rgba(0,51,88,0.05)] transition-all hover:-translate-y-0.5">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-3 font-headline text-4xl font-black text-primary">{value}</p>
      {helper ? (
        <p className="mt-2 text-xs font-medium text-on-surface-variant">{helper}</p>
      ) : null}
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
    <section className="rounded-[1.5rem] bg-surface-container-low p-5 shadow-[0px_12px_32px_rgba(0,51,88,0.05)] sm:p-6">
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
    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-on-surface-variant">
        Page {page} of {totalPages}
      </p>
      <div className="flex w-full items-center gap-3 sm:w-auto">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="flex-1 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function AdminSelectField({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
      <select
        className="w-full appearance-none rounded-xl border border-outline-variant/20 bg-surface-container-lowest py-3 pl-11 pr-4 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </div>
  );
}

export function AdminModal({
  isOpen,
  title,
  onClose,
  children,
}: {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/45 backdrop-blur-sm px-4 py-6">
      <div className="w-full max-w-2xl rounded-[1.5rem] bg-surface-container-low p-6 shadow-[0px_20px_50px_rgba(0,51,88,0.2)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="font-headline text-2xl font-bold text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface-container-high"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function AdminIconActionButton({
  icon,
  label,
  variant = "neutral",
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  variant?: "neutral" | "primary" | "danger";
  disabled?: boolean;
  onClick: () => void;
}) {
  const className =
    variant === "primary"
      ? "bg-primary text-on-primary hover:opacity-90"
      : variant === "danger"
        ? "bg-error-container text-on-error-container hover:opacity-90"
        : "border border-outline-variant/20 bg-surface-container-lowest text-primary hover:bg-surface-container-high";

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition disabled:opacity-60 ${className}`}
    >
      {icon}
    </button>
  );
}
