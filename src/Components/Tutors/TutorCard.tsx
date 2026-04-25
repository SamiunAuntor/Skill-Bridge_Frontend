import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import avatarImage from "@/assets/avatar.png";
import { TutorCategory, TutorSubject } from "@/types/tutor";

export type TutorCardDisplayData = {
  id: string;
  displayName: string;
  professionalTitle: string;
  avatarUrl: string | null;
  bio: string;
  hourlyRate: number;
  averageRating: number;
  totalReviews: number;
  isTopRated: boolean;
  categories: TutorCategory[];
  subjects: TutorSubject[];
};

type TutorCardProps = {
  tutor: TutorCardDisplayData;
  className?: string;
};

function formatHourlyRate(rate: number): string {
  return `$${Math.round(rate)}`;
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getBioPreview(bio: string, limit = 84): string {
  const normalizedBio = bio.trim();

  if (normalizedBio.length <= limit) {
    return normalizedBio;
  }

  const sliced = normalizedBio.slice(0, limit);
  const lastSpaceIndex = sliced.lastIndexOf(" ");

  return `${(lastSpaceIndex > 0 ? sliced.slice(0, lastSpaceIndex) : sliced).trim()}...`;
}

export default function TutorCard({ tutor, className = "" }: TutorCardProps) {
  const visibleSubjects = tutor.subjects.slice(0, 3);
  const remainingSubjects = Math.max(0, tutor.subjects.length - visibleSubjects.length);
  const visibleCategories = tutor.categories.slice(0, 2).map((category) => category.name);
  const hasLongBio = tutor.bio.trim().length > 120;
  const bioPreview = getBioPreview(tutor.bio);

  return (
    <article
      className={`flex h-full flex-col rounded-[1.75rem] border border-outline-variant/15 bg-surface-container-lowest p-7 shadow-[0px_10px_28px_rgba(0,51,88,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_16px_36px_rgba(0,51,88,0.09)] ${className}`.trim()}
    >
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-surface-container-highest">
          {tutor.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tutor.avatarUrl}
              alt={`${tutor.displayName} profile photo`}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <>
              <Image
                src={avatarImage}
                alt=""
                fill
                sizes="64px"
                className="object-cover opacity-20"
              />
              <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-primary">
                {getInitials(tutor.displayName)}
              </span>
            </>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-2">
            <h3 className="line-clamp-1 font-headline text-[1.45rem] font-extrabold leading-none tracking-tight text-primary">
              {tutor.displayName}
            </h3>
            {tutor.isTopRated ? (
              <span className="theme-secondary-soft inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]">
                <BadgeCheck className="h-3.5 w-3.5" />
                Top Rated
              </span>
            ) : null}
          </div>

          <div className="mt-2 flex items-center gap-2 text-secondary">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-semibold text-primary">
              {tutor.averageRating.toFixed(1)}{" "}
              <span className="text-on-surface-variant">({tutor.totalReviews} reviews)</span>
            </span>
          </div>

          {visibleCategories.length > 0 ? (
            <p className="mt-2 line-clamp-1 text-sm text-on-surface-variant">
              <span className="font-semibold text-primary">Categories:</span>{" "}
              {visibleCategories.join(", ")}
              {tutor.categories.length > 2 ? ` +${tutor.categories.length - 2} more` : ""}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex min-h-[40px] flex-wrap content-start gap-2">
        {visibleSubjects.length > 0 ? (
          <>
            {visibleSubjects.map((subject) => (
              <span
                key={subject.id}
                className="rounded-full bg-tertiary-fixed px-3 py-1 text-[11px] font-bold tracking-[0.08em] text-on-tertiary-fixed-variant"
              >
                {toTitleCase(subject.name)}
              </span>
            ))}
            {remainingSubjects > 0 ? (
              <span className="rounded-full bg-surface-container-high px-3 py-1 text-[11px] font-semibold text-primary">
                +{remainingSubjects} more
              </span>
            ) : null}
          </>
        ) : (
          <span className="rounded-full bg-surface-container-high px-3 py-1 text-[11px] font-semibold text-on-surface-variant">
            General Tutoring
          </span>
        )}
      </div>

      <div className="mt-2 min-h-[72px]">
        <p className="text-[0.92rem] leading-6 text-on-surface-variant">
          {hasLongBio ? bioPreview : tutor.bio.trim()}{" "}
          {hasLongBio ? (
            <Link
              href={`/tutors/${tutor.id}`}
              className="inline whitespace-nowrap font-semibold text-secondary hover:text-primary"
            >
              See more
            </Link>
          ) : null}
        </p>
      </div>

      <div className="mt-auto flex items-end justify-between gap-4 border-t border-outline-variant/25 pt-6">
        <p className="font-headline text-[2rem] font-black leading-none text-primary">
          {formatHourlyRate(tutor.hourlyRate)}
          <span className="ml-1 text-sm font-medium text-on-surface-variant">/hr</span>
        </p>

        <Link
          href={`/tutors/${tutor.id}`}
          className="rounded-[1rem] bg-primary px-6 py-3 text-center text-sm font-bold text-on-primary transition-transform hover:translate-y-[-1px]"
        >
          View Profile
        </Link>
      </div>
    </article>
  );
}
