import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import { TutorCard as TutorCardData } from "@/types/tutor";

type TutorCardProps = {
  tutor: TutorCardData;
  featured?: boolean;
};

function formatHourlyRate(rate: number): string {
  return `$${Math.round(rate)}`;
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
          <div className="flex flex-1 flex-col p-8">
            <div className="grid flex-1 gap-8 lg:grid-cols-[minmax(0,1.15fr)_190px] lg:items-start">
              <div className="flex min-w-0 flex-col">
                <div>
                  {tutor.isTopRated ? (
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary-container px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-on-secondary-container md:text-[10px]">
                      <BadgeCheck className="h-3 w-3" />
                      Top Rated Expert
                    </div>
                  ) : null}
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

                <p className="mt-5 max-w-3xl text-justify text-base leading-relaxed text-on-surface-variant">
                  {tutor.bio}
                </p>
              </div>

              <div className="flex h-full min-w-0 flex-col justify-between gap-6 lg:pl-2">
                <div className="text-left lg:text-right">
                  <p className="text-3xl font-black text-secondary">
                    {formatHourlyRate(tutor.hourlyRate)}
                    <span className="ml-1 text-sm font-medium text-on-surface-variant">
                      /hr
                    </span>
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-on-surface-variant lg:justify-end">
                    <Star className="h-4 w-4 shrink-0 fill-secondary text-secondary" />
                    <span>
                      {tutor.averageRating.toFixed(1)} ({tutor.totalReviews} reviews)
                    </span>
                  </p>
                </div>

                <div className="flex lg:justify-end">
                  <Link
                    href={`/tutors/${tutor.id}`}
                    className="inline-flex rounded-xl bg-primary px-8 py-3 text-center font-headline text-sm font-bold text-on-primary transition-transform hover:translate-y-[-1px]"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
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
            {tutor.isTopRated ? (
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-secondary-container px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                <BadgeCheck className="h-3 w-3" />
                Top Rated Expert
              </div>
            ) : null}
            <h3 className="font-headline text-xl font-bold text-primary">
              {tutor.displayName}
            </h3>
            <div className="flex items-center gap-1 text-sm font-semibold text-secondary">
              <Star className="h-4 w-4 fill-secondary text-secondary" />
              {tutor.averageRating.toFixed(1)} ({tutor.totalReviews} reviews)
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => (
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
        </div>
        <Link
          href={`/tutors/${tutor.id}`}
          className="rounded-xl bg-primary px-6 py-3 text-center font-headline text-sm font-bold text-on-primary transition-transform hover:translate-y-[-1px]"
        >
          View Profile
        </Link>
      </div>
    </article>
  );
}
