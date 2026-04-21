import Link from "next/link";
import { GraduationCap, ArrowRight, Star } from "lucide-react";

type FeaturedTutorsSectionProps = {
  tutors: Array<{
    id: string;
    displayName: string;
    professionalTitle: string;
    avatarUrl: string | null;
    bio: string;
    hourlyRate: number;
    averageRating: number;
    totalReviews: number;
    primarySubject: string;
  }>;
};

function formatRate(rate: number): string {
  return `$${Math.round(rate)}/hr`;
}

export default function FeaturedTutorsSection({
  tutors,
}: FeaturedTutorsSectionProps) {
  const [leadTutor, secondTutor, thirdTutor] = tutors;

  if (!leadTutor) {
    return null;
  }

  return (
    <section className="bg-surface py-24">
      <div className="mx-auto w-11/12 max-w-7xl">
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="mb-4 text-4xl font-bold text-primary">
              Learn from the <span className="text-secondary">Best Minds</span>
            </h2>
            <p className="text-lg text-on-surface-variant">
              Our top-rated tutors are vetted for both subject mastery and teaching
              excellence. Experience the difference of premium mentorship.
            </p>
          </div>
          <Link
            href="/tutors"
            className="group flex items-center gap-2 font-bold text-primary transition-all hover:gap-4"
          >
            Browse all tutors
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="group flex cursor-pointer flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0px_12px_32px_rgba(0,51,88,0.06)] transition-colors hover:bg-surface-container-high md:col-span-2 md:flex-row">
            <div className="aspect-square md:w-2/5 md:aspect-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="h-full w-full object-cover" src={leadTutor.avatarUrl ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80"} />
            </div>
            <div className="flex flex-col justify-center p-8 md:w-3/5">
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-full bg-tertiary-fixed px-3 py-1 text-xs font-bold uppercase text-on-tertiary-fixed-variant">
                  {leadTutor.primarySubject}
                </span>
                <div className="ml-auto flex text-secondary">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-1 text-sm font-bold text-primary">
                    {leadTutor.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
              <h3 className="mb-2 text-2xl font-bold text-primary">
                {leadTutor.displayName}
              </h3>
              <p className="mb-6 line-clamp-3 text-on-surface-variant">
                {leadTutor.bio}
              </p>
              <div className="mt-auto flex items-center gap-4">
                <div className="text-sm">
                  <p className="text-[10px] font-bold uppercase text-outline-variant">
                    Rate
                  </p>
                  <p className="font-bold text-primary">{formatRate(leadTutor.hourlyRate)}</p>
                </div>
                <Link
                  href={`/tutors/${leadTutor.id}`}
                  className="ml-auto rounded-md bg-primary px-6 py-2 text-sm font-bold text-on-primary opacity-0 transition-opacity group-hover:opacity-100"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>

          {secondTutor ? (
            <div className="group cursor-pointer rounded-xl bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)] transition-colors hover:bg-surface-container-high">
              <div className="mx-auto mb-6 h-24 w-24 overflow-hidden rounded-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" className="h-full w-full object-cover" src={secondTutor.avatarUrl ?? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"} />
              </div>
              <div className="text-center">
                <span className="mb-3 inline-block rounded-full bg-tertiary-fixed px-3 py-1 text-[10px] font-bold uppercase text-on-tertiary-fixed-variant">
                  {secondTutor.primarySubject}
                </span>
                <h3 className="mb-1 text-xl font-bold text-primary">
                  {secondTutor.displayName}
                </h3>
                <div className="mb-4 flex justify-center text-secondary">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-1 text-sm font-bold text-primary">
                    {secondTutor.averageRating.toFixed(1)}
                  </span>
                </div>
                <p className="mb-6 line-clamp-2 text-sm text-on-surface-variant">
                  {secondTutor.bio}
                </p>
                <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
                  <span className="font-bold text-primary">{formatRate(secondTutor.hourlyRate)}</span>
                  <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-2" />
                </div>
              </div>
            </div>
          ) : null}

          {thirdTutor ? (
            <div className="group cursor-pointer rounded-xl bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)] transition-colors hover:bg-surface-container-high">
              <div className="mx-auto mb-6 h-24 w-24 overflow-hidden rounded-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" className="h-full w-full object-cover" src={thirdTutor.avatarUrl ?? "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80"} />
              </div>
              <div className="text-center">
                <span className="mb-3 inline-block rounded-full bg-tertiary-fixed px-3 py-1 text-[10px] font-bold uppercase text-on-tertiary-fixed-variant">
                  {thirdTutor.primarySubject}
                </span>
                <h3 className="mb-1 text-xl font-bold text-primary">
                  {thirdTutor.displayName}
                </h3>
                <div className="mb-4 flex justify-center text-secondary">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-1 text-sm font-bold text-primary">
                    {thirdTutor.averageRating.toFixed(1)}
                  </span>
                </div>
                <p className="mb-6 line-clamp-2 text-sm text-on-surface-variant">
                  {thirdTutor.bio}
                </p>
                <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
                  <span className="font-bold text-primary">{formatRate(thirdTutor.hourlyRate)}</span>
                  <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-2" />
                </div>
              </div>
            </div>
          ) : null}

          <div className="group relative overflow-hidden rounded-2xl bg-primary-container p-10 shadow-sm transition-all duration-300 md:col-span-2 md:p-14">
            <div className="relative z-10 flex flex-col gap-8">
              <div className="max-w-3xl space-y-4">
                <h3 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                  Want to <span className="text-secondary">Teach?</span>
                </h3>

                <p className="text-lg leading-relaxed text-on-primary-container/90 md:text-xl">
                  Join our elite roster of intellectuals and share your
                  knowledge with motivated students globally. We are looking for
                  distinguished tutors to shape the future of learning.
                </p>
              </div>

              <div className="flex justify-start">
                <button className="flex items-center gap-3 rounded-xl bg-secondary px-10 py-4 font-headline text-lg font-bold text-on-secondary shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Become a Tutor
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-8 -right-8 text-on-primary-container opacity-10 transition-transform duration-500 group-hover:scale-105">
              <GraduationCap
                size={240}
                strokeWidth={1}
                className="rotate-[-10deg] select-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
