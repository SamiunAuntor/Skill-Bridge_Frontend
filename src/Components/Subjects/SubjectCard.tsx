import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export type SubjectCardData = {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  description: string | null;
  categoryName: string;
  tutorCount?: number;
};

type SubjectCardProps = {
  subject: SubjectCardData;
  compact?: boolean;
};

function getDescriptionPreview(description: string, limit = 132): string {
  const normalizedDescription = description.trim();

  if (normalizedDescription.length <= limit) {
    return normalizedDescription;
  }

  const sliced = normalizedDescription.slice(0, limit);
  const lastSpaceIndex = sliced.lastIndexOf(" ");

  return `${(lastSpaceIndex > 0 ? sliced.slice(0, lastSpaceIndex) : sliced).trim()}...`;
}

export default function SubjectCard({
  subject,
  compact = false,
}: SubjectCardProps) {
  if (compact) {
    return (
      <Link
        href={`/subjects/${subject.slug}`}
        className="group flex h-[260px] min-w-[260px] max-w-[260px] flex-col items-center justify-center rounded-[1.6rem] border border-outline-variant/15 bg-surface-container-lowest p-6 text-center shadow-[0px_12px_32px_rgba(0,51,88,0.05)] transition-all hover:-translate-y-1 hover:bg-surface-bright"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed text-primary transition-transform group-hover:-translate-y-1">
          {subject.iconUrl ? (
            <Image
              src={subject.iconUrl}
              alt={`${subject.name} icon`}
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
          ) : (
            <BookOpen className="h-8 w-8" />
          )}
        </div>

        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
          {subject.categoryName}
        </p>
        <h3 className="mt-3 font-headline text-2xl font-medium text-primary">
          {subject.name}
        </h3>
      </Link>
    );
  }

  const description =
    subject.description ||
    "Discover tutors, compare teaching styles, and start learning this subject with confidence.";
  const hasLongDescription = description.trim().length > 150;
  const descriptionPreview = getDescriptionPreview(description);

  return (
    <Link
      href={`/subjects/${subject.slug}`}
      className={`group flex h-full flex-col rounded-[1.6rem] border border-outline-variant/15 bg-surface-container-lowest shadow-[0px_12px_32px_rgba(0,51,88,0.05)] transition-all hover:-translate-y-1 hover:bg-surface-bright ${
        compact ? "min-w-[280px] max-w-[280px] p-6" : "p-6"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
          {subject.iconUrl ? (
            <Image
              src={subject.iconUrl}
              alt={`${subject.name} icon`}
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
          ) : (
            <BookOpen className="h-7 w-7" />
          )}
        </div>

        {typeof subject.tutorCount === "number" ? (
          <span className="rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
            {subject.tutorCount} tutor{subject.tutorCount === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
          {subject.categoryName}
        </p>
        <h3 className="mt-2 font-headline text-2xl font-extrabold text-primary">
          {subject.name}
        </h3>
        <div className="mt-4 min-h-[90px]">
          <p className="text-sm leading-7 text-on-surface-variant">
            {hasLongDescription ? descriptionPreview : description.trim()}{" "}
            {hasLongDescription ? (
              <span className="font-semibold text-secondary">See more</span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-end border-t border-outline-variant/25 pt-5">
        <span className="rounded-[1rem] bg-primary px-6 py-3 text-center text-sm font-bold text-on-primary transition-transform group-hover:translate-y-[-1px]">
          View Subject
        </span>
      </div>
    </Link>
  );
}
