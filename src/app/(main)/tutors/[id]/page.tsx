import {
  BadgeCheck,
  BookOpenCheck,
  FlaskConical,
  Lock,
  MessageSquareQuote,
  Sigma,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { notFound } from "next/navigation";
import { TutorApiError, getTutorById } from "@/lib/tutor-api";
import {
  TutorAvailabilitySlot,
  TutorCategory,
  TutorDetailResponse,
  TutorEducation,
  TutorExpertise,
  TutorTestimonial,
} from "@/types/tutor";

export const metadata = {
  title: "Tutor Profile | SkillBridge",
  description:
    "Explore tutor expertise, education, student reviews, and booking details on SkillBridge.",
};

type TutorProfilePageProps = {
  params: Promise<{ id: string }>;
};

const masteryIcons = [Sigma, FlaskConical, TrendingUp];
const fallbackSlotDays = ["M", "T", "W", "T", "F", "S", "S"];
const fallbackSlotDates = [
  { label: "28", disabled: true },
  { label: "29", disabled: true },
  { label: "30", disabled: true },
  { label: "1", active: true },
  { label: "2" },
  { label: "3" },
  { label: "4" },
];
const fallbackTimeSlots = [
  { label: "09:00 AM" },
  { label: "11:30 AM" },
  { label: "02:00 PM", active: true },
  { label: "04:30 PM" },
];

function formatHoursTaught(totalHoursTaught: number): string {
  if (totalHoursTaught >= 100) {
    return `${Math.round(totalHoursTaught)}+`;
  }

  if (Number.isInteger(totalHoursTaught)) {
    return String(totalHoursTaught);
  }

  return totalHoursTaught.toFixed(1);
}

function formatRelativeDate(isoDate: string): string {
  const createdAt = new Date(isoDate);
  const differenceInDays = Math.max(
    0,
    Math.round((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
  );

  if (differenceInDays === 0) {
    return "Today";
  }

  if (differenceInDays === 1) {
    return "1 day ago";
  }

  if (differenceInDays < 30) {
    return `${differenceInDays} days ago`;
  }

  const weeks = Math.round(differenceInDays / 7);
  return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
}

function buildProfileSubjects(
  categories: TutorCategory[],
  expertise: TutorExpertise[]
): Array<{ id: string; name: string }> {
  const uniqueItems = new Map<string, { id: string; name: string }>();

  for (const item of [...categories, ...expertise]) {
    const key = item.slug || item.name.toLowerCase();
    if (!uniqueItems.has(key)) {
      uniqueItems.set(key, { id: item.id, name: item.name });
    }
  }

  return [...uniqueItems.values()];
}

function buildMasteryItems(
  categories: TutorCategory[],
  expertise: TutorExpertise[]
): Array<{ key: string; title: string; subtitle: string; iconIndex: number }> {
  if (expertise.length > 0) {
    return expertise.map((item, index) => ({
      key: item.id,
      title: item.name,
      subtitle:
        categories[index % Math.max(categories.length, 1)]?.name || "Specialized tutoring",
      iconIndex: index,
    }));
  }

  return categories.map((item, index) => ({
    key: item.id,
    title: item.name,
    subtitle: "Guided tutoring support",
    iconIndex: index,
  }));
}

function buildCalendarData(slots: TutorAvailabilitySlot[]) {
  if (slots.length === 0) {
    return {
      monthLabel: "Upcoming",
      slotDays: fallbackSlotDays,
      slotDates: fallbackSlotDates,
      timeSlots: fallbackTimeSlots,
    };
  }

  const uniqueDates = new Map<
    string,
    { label: string; weekday: string; date: Date }
  >();

  for (const slot of slots) {
    const slotDate = new Date(slot.startTime);
    const key = slotDate.toISOString().slice(0, 10);

    if (!uniqueDates.has(key) && uniqueDates.size < 7) {
      uniqueDates.set(key, {
        label: String(slotDate.getDate()),
        weekday: new Intl.DateTimeFormat("en-US", {
          weekday: "short",
        })
          .format(slotDate)
          .slice(0, 1)
          .toUpperCase(),
        date: slotDate,
      });
    }
  }

  const visibleDates = [...uniqueDates.values()];
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(visibleDates[0]?.date ?? new Date());

  const timeSlots = slots.slice(0, 4).map((slot, index) => ({
    label: new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(slot.startTime)),
    active: index === 0,
  }));

  return {
    monthLabel,
    slotDays: visibleDates.map((item) => item.weekday),
    slotDates: visibleDates.map((item, index) => ({
      label: item.label,
      active: index === 0,
    })),
    timeSlots: timeSlots.length > 0 ? timeSlots : fallbackTimeSlots,
  };
}

function TestimonialCard({ testimonial }: { testimonial: TutorTestimonial }) {
  return (
    <article className="rounded-xl bg-surface-container-lowest p-8 shadow-[0px_4px_20px_rgba(0,51,88,0.04)]">
      <div className="mb-4 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={testimonial.student.name}
          className="h-12 w-12 rounded-full object-cover"
          src={
            testimonial.student.avatarUrl ??
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
          }
          referrerPolicy="no-referrer"
        />
        <div>
          <h4 className="font-bold text-primary">{testimonial.student.name}</h4>
          <div className="flex gap-1 text-amber-500">
            {Array.from({ length: testimonial.rating }).map((_, index) => (
              <Sparkles key={index} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
        </div>
        <time className="ml-auto text-xs font-medium text-on-surface-variant">
          {formatRelativeDate(testimonial.createdAt)}
        </time>
      </div>
      <p className="italic leading-relaxed text-on-surface-variant">
        &quot;{testimonial.comment || "A highly recommended tutoring experience."}
        &quot;
      </p>
    </article>
  );
}

function EducationCard({
  item,
  elevated,
}: {
  item: TutorEducation;
  elevated: boolean;
}) {
  return (
    <article
      className={`rounded-xl p-8 ${
        elevated
          ? "border border-outline-variant/10 bg-surface-container-lowest shadow-[0px_12px_32px_rgba(0,51,88,0.06)]"
          : "bg-surface-container-low"
      }`}
    >
      <p className="mb-2 text-sm font-bold text-secondary">
        {item.startYear}
        {item.endYear ? ` - ${item.endYear}` : " - Present"}
      </p>
      <h3 className="text-lg font-bold text-primary">{item.degree}</h3>
      <p className="mt-1 text-sm text-on-surface-variant">{item.institution}</p>
      <p className="mt-1 text-xs font-medium text-on-surface-variant">
        {item.fieldOfStudy}
      </p>
      {item.description ? (
        <p className="mt-4 text-sm italic text-on-tertiary-fixed-variant">
          {item.description}
        </p>
      ) : null}
    </article>
  );
}

export default async function TutorProfilePage({
  params,
}: TutorProfilePageProps) {
  const { id } = await params;

  let tutorData: TutorDetailResponse;

  try {
    tutorData = await getTutorById(id);
  } catch (error) {
    if (error instanceof TutorApiError && error.statusCode === 404) {
      notFound();
    }

    throw error;
  }

  const tutor = tutorData.tutor;
  const profileSubjects = buildProfileSubjects(tutor.categories, tutor.expertise);
  const masteryItems = buildMasteryItems(tutor.categories, tutor.expertise);
  const { monthLabel, slotDays, slotDates, timeSlots } = buildCalendarData(
    tutor.availableSlots
  );
  const testimonials =
    tutor.testimonials.length > 0
      ? tutor.testimonials
      : [
          {
            id: "placeholder",
            rating: Math.max(Math.round(tutor.averageRating), 5),
            comment:
              "Students will see testimonials here as soon as reviews are added.",
            createdAt: new Date().toISOString(),
            student: {
              id: "placeholder-student",
              name: "SkillBridge Student",
              avatarUrl: null,
            },
          },
        ];

  return (
    <section className="pb-20 pt-8">
      <div className="mx-auto w-11/12 max-w-[1440px]">
        <header className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center lg:col-span-8">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-[1.4rem] bg-gradient-to-r from-primary to-secondary opacity-20 blur transition duration-700 group-hover:opacity-35" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={tutor.displayName}
                className="relative h-44 w-44 rounded-[1.35rem] border-4 border-surface-container-lowest object-cover shadow-xl md:h-48 md:w-48"
                src={
                  tutor.avatarUrl ??
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80"
                }
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1 space-y-3">
              {tutor.isTopRated ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-on-secondary-container md:text-[10px]">
                  <BadgeCheck className="h-3 w-3" />
                  Top Rated Expert
                </div>
              ) : null}

              <h1 className="font-headline text-[2.15rem] font-extrabold leading-[0.94] tracking-tight text-primary md:text-[2.55rem] lg:text-[3rem]">
                {tutor.displayName}
              </h1>

              <p className="max-w-2xl text-[0.9rem] font-medium leading-[1.28] text-on-surface-variant md:text-[0.98rem] lg:text-[1.08rem]">
                {tutor.professionalTitle.trim() || "Professional Tutor"}
              </p>

              <div className="flex flex-wrap gap-2.5 pt-1">
                {profileSubjects.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-md bg-tertiary-fixed px-2.5 py-1 text-[10px] font-semibold text-on-tertiary-fixed-variant md:text-[11px]"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-6 lg:col-span-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-surface-container-low p-6 text-center shadow-sm">
                <div className="font-headline text-3xl font-black text-primary">
                  {tutor.averageRating.toFixed(1)}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                  Rating
                </div>
              </div>
              <div className="rounded-xl bg-surface-container-low p-6 text-center shadow-sm">
                <div className="font-headline text-3xl font-black text-primary">
                  {formatHoursTaught(tutor.totalHoursTaught)}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                  Hours Taught
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="space-y-16 lg:col-span-8">
            <section>
              <h2 className="mb-6 flex items-center gap-3 font-headline text-2xl font-bold text-primary">
                <Sparkles className="h-5 w-5 text-secondary" />
                Bio
              </h2>
              <div className="space-y-4 text-base leading-relaxed text-on-surface-variant">
                <p>{tutor.bio}</p>
              </div>
            </section>

            <section>
              <h2 className="mb-8 flex items-center gap-3 font-headline text-2xl font-bold text-primary">
                <BookOpenCheck className="h-5 w-5 text-secondary" />
                Academic Background
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {tutor.education.length > 0 ? (
                  tutor.education.map((item, index) => (
                    <EducationCard
                      key={item.id}
                      item={item}
                      elevated={index === 0}
                    />
                  ))
                ) : (
                  <article className="rounded-xl bg-surface-container-low p-8">
                    <p className="text-sm text-on-surface-variant">
                      Academic background will appear once the tutor completes their
                      profile setup.
                    </p>
                  </article>
                )}
              </div>
            </section>

            <section>
              <h2 className="mb-8 flex items-center gap-3 font-headline text-2xl font-bold text-primary">
                <FlaskConical className="h-5 w-5 text-secondary" />
                Offered Tutorings
              </h2>
              <div className="flex flex-wrap gap-4">
                {masteryItems.length > 0 ? (
                  masteryItems.map((item) => {
                    const Icon = masteryIcons[item.iconIndex % masteryIcons.length];

                    return (
                      <div
                        key={item.key}
                        className="flex items-center gap-3 rounded-xl border border-outline-variant/10 bg-surface-container-lowest px-6 py-4 shadow-sm transition-transform hover:-translate-y-0.5"
                      >
                        <Icon className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-bold text-primary">{item.title}</div>
                          <div className="text-xs text-on-surface-variant">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl bg-surface-container-low px-6 py-4 text-sm text-on-surface-variant">
                    Offered tutorings will appear when categories or expertise are
                    added.
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="mb-8 flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-3 font-headline text-2xl font-bold text-primary">
                  <MessageSquareQuote className="h-5 w-5 text-secondary" />
                  Student Testimonials
                </h2>
                <button className="text-sm font-bold text-secondary hover:underline">
                  View all {tutor.totalReviews} reviews
                </button>
              </div>

              <div className="space-y-8">
                {testimonials.map((testimonial) => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                ))}
              </div>
            </section>
          </div>

          <aside className="self-start lg:col-span-4 lg:flex lg:justify-end">
            <div className="w-full max-w-[21rem] overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-lowest shadow-[0px_18px_36px_rgba(0,51,88,0.08)]">
              <div className="bg-primary p-5 text-on-primary">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="font-headline text-[2.2rem] font-black">
                      ${Math.round(tutor.hourlyRate)}
                    </span>
                    <span className="ml-1 text-xs font-medium text-on-primary-container">
                      / 60 min session
                    </span>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold backdrop-blur-sm">
                    <Sparkles className="h-3 w-3" />
                    Instant Booking
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <h3 className="mb-3 flex items-center justify-between text-[14px] font-bold text-primary">
                    <span>Select Date</span>
                    <span className="text-[11px] font-semibold text-secondary">
                      {monthLabel}
                    </span>
                  </h3>

                  <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-on-surface-variant">
                    {slotDays.map((day, index) => (
                      <div key={`${day}-${index}`}>{day}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {slotDates.map((day, index) => (
                      <button
                        key={`${day.label}-${index}`}
                        className={`flex h-8 items-center justify-center rounded-md text-[12px] font-medium ${
                          "disabled" in day && day.disabled
                            ? "cursor-not-allowed text-on-surface-variant/40"
                            : day.active
                              ? "bg-secondary-container font-bold text-on-secondary-container ring-2 ring-secondary ring-offset-2"
                              : "text-primary transition-colors hover:bg-surface-container-low"
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-[14px] font-bold text-primary">
                    Available Slots
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.label}
                        className={`rounded-md px-3.5 py-2.5 text-[12px] font-semibold transition-colors ${
                          slot.active
                            ? "bg-primary text-on-primary shadow-sm"
                            : "border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low"
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="w-full rounded-md bg-gradient-to-r from-primary to-primary-container py-3 text-[14px] font-bold text-on-primary shadow-lg transition-all hover:shadow-xl active:scale-[0.99]">
                  Book a Session
                </button>

                <div className="flex items-center justify-center gap-2.5 pt-2 text-[10px] font-medium text-on-surface-variant">
                  <Lock className="h-3.5 w-3.5" />
                  Secure payment & 100% Satisfaction Guarantee
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
