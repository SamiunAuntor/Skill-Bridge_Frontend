"use client";

import { GraduationCap, PencilLine, ShieldCheck, UserRound } from "lucide-react";
import type { ProfileFormState } from "./shared";

type TutorIdentityCardProps = {
  completionCompleted: number;
  completionPercentage: number;
  completionTotal: number;
  errorMessage: string | null;
  formState: ProfileFormState;
  isEmailVerified: boolean;
  onEdit: () => void;
  roleLabel: string;
  tutorName: string;
};

export default function TutorIdentityCard({
  completionCompleted,
  completionPercentage,
  completionTotal,
  errorMessage,
  formState,
  isEmailVerified,
  onEdit,
  roleLabel,
  tutorName,
}: TutorIdentityCardProps) {
  return (
    <section className="rounded-[1.55rem] border border-outline-variant/25 bg-surface-container p-6 shadow-[0px_16px_40px_rgba(0,51,88,0.08)] dark:border-outline-variant/10 dark:bg-surface-container-low dark:shadow-[0px_12px_32px_rgba(0,0,0,0.24)]">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-surface-container-highest shadow-[0px_14px_30px_rgba(0,51,88,0.12)]">
            {formState.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="Tutor profile preview"
                className="h-full w-full object-cover"
                src={formState.profileImageUrl}
              />
            ) : (
              <span className="material-symbols-outlined text-7xl text-on-surface-variant">
                account_circle
              </span>
            )}
          </div>
        </div>

        <div className="rounded-[1.35rem] border border-outline-variant/20 bg-surface-container-lowest p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                Tutor Profile
              </p>
              <h2 className="mt-2 font-headline text-[1.9rem] font-extrabold tracking-tight text-primary">
                Build your public tutoring identity
              </h2>
              <p className="mt-2 text-[13px] text-on-surface-variant">
                Set up the information students will see on your public tutor profile.
              </p>
            </div>

            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-headline text-[13px] font-bold text-on-primary transition hover:opacity-90"
            >
              <PencilLine className="h-4 w-4" />
              Edit Profile
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-outline-variant/20 bg-surface px-4 py-4">
              <div className="flex items-center gap-2 text-secondary">
                <UserRound className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                  Name
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-primary">{tutorName}</p>
            </div>
            <div className="rounded-2xl border border-outline-variant/20 bg-surface px-4 py-4">
              <div className="flex items-center gap-2 text-secondary">
                <GraduationCap className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                  Role
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold capitalize text-primary">
                {roleLabel}
              </p>
            </div>
            <div className="rounded-2xl border border-outline-variant/20 bg-surface px-4 py-4">
              <div className="flex items-center gap-2 text-secondary">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                  Verification
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-primary">
                {isEmailVerified ? "Email verified" : "Email not verified"}
              </p>
            </div>
          </div>

          <div className="theme-primary-soft-surface mt-5 rounded-2xl p-4">
            <div className="flex items-center justify-between text-[12px] font-semibold text-primary">
              <span>
                Completion {completionCompleted}/{completionTotal}
              </span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/70">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 text-[12px] text-on-surface-variant">
            Required: professional title, bio, hourly rate, category, and subject. Education is optional and can be managed separately.
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-xl bg-error-container px-4 py-3 text-[13px] text-on-error-container">
              {errorMessage}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
