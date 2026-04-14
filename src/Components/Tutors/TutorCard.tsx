import Link from "next/link";
import { TutorCard as TutorCardData } from "@/types/tutor";

type TutorCardProps = {
  tutor: TutorCardData;
  featured?: boolean;
};

function formatHourlyRate(rate: number): string {
  return `$${Math.round(rate)}`;
}

function formatAvailabilityLabel(nextAvailableSlot: string | null): string {
  if (!nextAvailableSlot) {
    return "No upcoming availability";
  }

  return new Intl.DateTimeFormat("en-BD", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(nextAvailableSlot));
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function Avatar({
  name,
  avatarUrl,
  featured = false,
}: {
  name: string;
  avatarUrl: string | null;
  featured?: boolean;
}) {
  const sizeClass = featured ? "h-full w-full" : "h-16 w-16";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClass} object-cover ${featured ? "" : "rounded-full"}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center bg-primary text-lg font-black text-on-primary ${featured ? "" : "rounded-full"}`}
    >
      {getInitials(name)}
    </div>
  );
}

export default function TutorCard({ tutor, featured = false }: TutorCardProps) {
  const tags = tutor.expertise.length > 0 ? tutor.expertise : tutor.categories;

  if (featured) {
    return (
      <article className="group overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,51,88,0.04)] transition-all duration-300 hover:shadow-[0px_12px_32px_rgba(0,51,88,0.08)] md:col-span-2">
        <div className="flex flex-col md:flex-row">
          <div className="h-72 overflow-hidden md:h-auto md:w-72">
            <Avatar
              name={tutor.displayName}
              avatarUrl={tutor.avatarUrl}
              featured
            />
          </div>
          <div className="flex flex-1 flex-col justify-between p-8">
            <div className="space-y-5">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="font-headline text-3xl font-extrabold tracking-tight text-primary">
                    {tutor.displayName}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full bg-tertiary-fixed px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-on-tertiary-fixed-variant"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-3xl font-black text-secondary">
                    {formatHourlyRate(tutor.hourlyRate)}
                    <span className="ml-1 text-sm font-medium text-on-surface-variant">
                      /hr
                    </span>
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-on-surface-variant md:justify-end">
                    <span
                      className="material-symbols-outlined text-secondary"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      star
                    </span>
                    {tutor.averageRating.toFixed(1)} ({tutor.totalReviews} reviews)
                  </p>
                </div>
              </div>

              <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant">
                {tutor.bio}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href={`/tutors/${tutor.id}`}
                className="rounded-xl bg-primary px-8 py-3 text-center font-headline text-sm font-bold text-on-primary transition-transform hover:translate-y-[-1px]"
              >
                View Profile
              </Link>
              <Link
                href={`/tutors/${tutor.id}`}
                className="rounded-xl border border-outline-variant/30 px-8 py-3 text-center text-sm font-bold text-primary transition-colors hover:bg-surface-container-low"
              >
                Book Trial
              </Link>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-on-surface-variant sm:ml-auto">
                {formatAvailabilityLabel(tutor.nextAvailableSlot)}
              </p>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col justify-between rounded-2xl bg-surface-container-lowest p-8 shadow-[0px_4px_20px_rgba(0,51,88,0.04)] transition-colors duration-300 hover:bg-primary-fixed">
      <div>
        <div className="mb-6 flex items-center gap-4">
          <Avatar name={tutor.displayName} avatarUrl={tutor.avatarUrl} />
          <div>
            <h3 className="font-headline text-xl font-bold text-primary">
              {tutor.displayName}
            </h3>
            <div className="flex items-center gap-1 text-sm font-semibold text-secondary">
              <span
                className="material-symbols-outlined text-base"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                star
              </span>
              {tutor.averageRating.toFixed(1)} ({tutor.totalReviews} reviews)
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-tertiary-fixed px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-on-tertiary-fixed-variant"
            >
              {tag.name}
            </span>
          ))}
        </div>

        <p className="line-clamp-4 text-sm leading-relaxed text-on-surface-variant">
          {tutor.bio}
        </p>
      </div>

      <div className="mt-8 flex items-end justify-between gap-4 border-t border-outline-variant/10 pt-5">
        <div>
          <p className="text-3xl font-black text-primary">
            {formatHourlyRate(tutor.hourlyRate)}
            <span className="ml-1 text-xs font-medium text-on-surface-variant">
              /hr
            </span>
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
            {formatAvailabilityLabel(tutor.nextAvailableSlot)}
          </p>
        </div>
        <Link
          href={`/tutors/${tutor.id}`}
          className="flex items-center gap-1 text-sm font-bold text-primary transition-all hover:gap-2"
        >
          View Profile
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
    </article>
  );
}
