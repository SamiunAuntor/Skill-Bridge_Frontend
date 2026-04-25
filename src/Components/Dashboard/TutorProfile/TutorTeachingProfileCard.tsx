"use client";

import { BookOpen, BriefcaseBusiness, PencilLine, Wallet } from "lucide-react";
import type { ProfileFormState } from "./shared";
import { sectionCardClass } from "./shared";

type TutorTeachingProfileCardProps = {
  formState: ProfileFormState;
  onEdit: () => void;
  selectedCategoryNames: string[];
  selectedSubjectNames: string[];
};

export default function TutorTeachingProfileCard({
  formState,
  onEdit,
  selectedCategoryNames,
  selectedSubjectNames,
}: TutorTeachingProfileCardProps) {
  return (
    <article className={sectionCardClass}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-headline text-[1.35rem] font-bold text-primary">
            Teaching Profile
          </h3>
          <p className="mt-1 text-[12px] text-on-surface-variant">
            Public summary of your teaching identity and pricing.
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-[13px] font-bold text-on-primary"
        >
          <PencilLine className="h-4 w-4" />
          Edit
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-outline-variant/20 bg-surface px-4 py-4">
          <div className="flex items-center gap-2 text-secondary">
            <BriefcaseBusiness className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
              Professional Title
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-primary">
            {formState.professionalTitle || "Not added yet"}
          </p>
        </div>
        <div className="rounded-2xl border border-outline-variant/20 bg-surface px-4 py-4">
          <div className="flex items-center gap-2 text-secondary">
            <Wallet className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
              Rate & Experience
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-primary">
            ${formState.hourlyRate}/hr · {formState.experienceYears} yrs
          </p>
        </div>
        <div className="rounded-2xl border border-outline-variant/20 bg-surface px-4 py-4 md:col-span-2">
          <div className="flex items-center gap-2 text-secondary">
            <BookOpen className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
              Categories
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedCategoryNames.length > 0 ? (
              selectedCategoryNames.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-surface-container-high px-3 py-1 text-[12px] font-semibold text-primary"
                >
                  {name}
                </span>
              ))
            ) : (
              <span className="text-[13px] text-on-surface-variant">
                No categories selected yet.
              </span>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-outline-variant/20 bg-surface px-4 py-4 md:col-span-2">
          <div className="flex items-center gap-2 text-secondary">
            <BookOpen className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
              Subjects
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedSubjectNames.length > 0 ? (
              selectedSubjectNames.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-primary-fixed px-3 py-1 text-[12px] font-semibold text-primary"
                >
                  {name}
                </span>
              ))
            ) : (
              <span className="text-[13px] text-on-surface-variant">
                No subjects selected yet.
              </span>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-outline-variant/20 bg-surface px-4 py-4 md:col-span-2">
          <div className="flex items-center gap-2 text-secondary">
            <PencilLine className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
              Bio
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
            {formState.bio}
          </p>
        </div>
      </div>
    </article>
  );
}
