"use client";

import { PencilLine } from "lucide-react";
import { sectionCardClass } from "./shared";

type TutorEducationCardProps = {
  educationSummaries: Array<{
    id: string;
    degreeName: string;
    institution: string;
    period: string;
  }>;
  onManage: () => void;
};

export default function TutorEducationCard({
  educationSummaries,
  onManage,
}: TutorEducationCardProps) {
  return (
    <article className={sectionCardClass}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-headline text-[1.35rem] font-bold text-primary">
            Education
          </h3>
          <p className="mt-1 text-[12px] text-on-surface-variant">
            Add, update, or remove your academic background from one place.
          </p>
        </div>
        <button
          type="button"
          onClick={onManage}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-[13px] font-bold text-on-primary"
        >
          <PencilLine className="h-4 w-4" />
          Manage
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {educationSummaries.length > 0 ? (
          educationSummaries.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-outline-variant/20 bg-surface px-4 py-4"
            >
              <p className="text-sm font-bold text-primary">{item.degreeName}</p>
              <p className="mt-1 text-sm text-on-surface-variant">{item.institution}</p>
              <p className="mt-1 text-[12px] text-on-surface-variant">{item.period}</p>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-outline-variant/25 bg-surface px-4 py-6 text-sm text-on-surface-variant">
            No education added yet.
          </div>
        )}
      </div>
    </article>
  );
}
