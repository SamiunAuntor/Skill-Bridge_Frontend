import {
  BadgeCheck,
  BookOpenCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FlaskConical,
  Lock,
  MessageSquareQuote,
  Sigma,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export const metadata = {
  title: "Tutor Profile | SkillBridge",
  description:
    "Explore tutor expertise, education, student reviews, and booking details on SkillBridge.",
};

const masteryItems = [
  {
    title: "Advanced Calculus",
    subtitle: "Multivariable & Vector Space",
    icon: Sigma,
  },
  {
    title: "Quantum Mechanics",
    subtitle: "Schrodinger Equations & Spin",
    icon: FlaskConical,
  },
  {
    title: "Python for Science",
    subtitle: "NumPy, SciPy & Matplotlib",
    icon: TrendingUp,
  },
];

const testimonials = [
  {
    name: "Marcus Thorne",
    time: "2 days ago",
    quote:
      "Dr. Vance has a unique ability to make the most abstract physics concepts feel tangible. She helped me ace my Graduate Record Exam in just 3 weeks of intensive sessions.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Sarah Jenkins",
    time: "1 week ago",
    quote:
      "Incredibly patient and thorough. The whiteboard sessions we did for fluid dynamics were a game changer for my finals.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
];

const educationItems = [
  {
    years: "2014 — 2018",
    degree: "PhD in Theoretical Physics",
    institution: "University of Oxford",
    note: 'Thesis: "Non-equilibrium Dynamics in Open Quantum Systems"',
    elevated: true,
  },
  {
    years: "2010 — 2014",
    degree: "MA in Applied Mathematics",
    institution: "MIT",
    note: "",
    elevated: false,
  },
];

const slotDays = ["M", "T", "W", "T", "F", "S", "S"];
const slotDates = [
  { label: "28", disabled: true },
  { label: "29", disabled: true },
  { label: "30", disabled: true },
  { label: "1", active: true },
  { label: "2" },
  { label: "3" },
  { label: "4" },
];

const timeSlots = [
  { label: "09:00 AM" },
  { label: "11:30 AM" },
  { label: "02:00 PM", active: true },
  { label: "04:30 PM" },
];

export default function TutorProfilePage() {
  return (
    <section className="pb-20 pt-8">
      <div className="mx-auto w-11/12 max-w-[1440px]">
        <header className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center lg:col-span-8">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-[1.4rem] bg-gradient-to-r from-primary to-secondary opacity-20 blur transition duration-700 group-hover:opacity-35" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Dr. Helena Vance"
                className="relative h-44 w-44 rounded-[1.35rem] border-4 border-surface-container-lowest object-cover shadow-xl md:h-48 md:w-48"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-on-secondary-container md:text-[10px]">
                <BadgeCheck className="h-3 w-3" />
                Top Rated Expert
              </div>

              <h1 className="font-headline text-[2.15rem] font-extrabold leading-[0.94] tracking-tight text-primary md:text-[2.55rem] lg:text-[3rem]">
                Dr. Helena Vance
              </h1>

              <p className="max-w-2xl text-[0.9rem] font-medium leading-[1.28] text-on-surface-variant md:text-[0.98rem] lg:text-[1.08rem]">
                Senior Researcher & Lecturer specializing in Quantum Physics and
                Advanced Applied Mathematics.
              </p>

              <div className="flex flex-wrap gap-2.5 pt-1">
                {["Quantum Physics", "Applied Math", "Scientific Computing"].map(
                  (tag) => (
                    <span
                      key={tag}
                        className="rounded-md bg-tertiary-fixed px-2.5 py-1 text-[10px] font-semibold text-on-tertiary-fixed-variant md:text-[11px]"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-6 lg:col-span-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-surface-container-low p-6 text-center shadow-sm">
                <div className="font-headline text-3xl font-black text-primary">
                  4.9
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                  Rating
                </div>
              </div>
              <div className="rounded-xl bg-surface-container-low p-6 text-center shadow-sm">
                <div className="font-headline text-3xl font-black text-primary">
                  850+
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
                <p>
                  With over 12 years of experience spanning both institutional
                  teaching and private consultancy, I bridge the gap between
                  theoretical complexity and practical understanding. My approach
                  is rooted in Socratic questioning, ensuring that students do not
                  just memorize formulas but grasp the underlying architectural
                  logic of the universe.
                </p>
                <p>
                  Currently a visiting fellow at the Newton Institute, I dedicate
                  15 hours a week to mentoring advanced students through
                  SkillBridge. Whether you are navigating the nuances of
                  wave-particle duality or optimizing stochastic models, my
                  sessions are structured as a collaborative exploration.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-8 flex items-center gap-3 font-headline text-2xl font-bold text-primary">
                <BookOpenCheck className="h-5 w-5 text-secondary" />
                Academic Background
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {educationItems.map((item) => (
                  <article
                    key={item.degree}
                    className={`rounded-xl p-8 ${
                      item.elevated
                        ? "border border-outline-variant/10 bg-surface-container-lowest shadow-[0px_12px_32px_rgba(0,51,88,0.06)]"
                        : "bg-surface-container-low"
                    }`}
                  >
                    <p className="mb-2 text-sm font-bold text-secondary">
                      {item.years}
                    </p>
                    <h3 className="text-lg font-bold text-primary">{item.degree}</h3>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {item.institution}
                    </p>
                    {item.note ? (
                      <p className="mt-4 text-sm italic text-on-tertiary-fixed-variant">
                        {item.note}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-8 flex items-center gap-3 font-headline text-2xl font-bold text-primary">
                <FlaskConical className="h-5 w-5 text-secondary" />
                Offered Tutorings
              </h2>
              <div className="flex flex-wrap gap-4">
                {masteryItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
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
                })}
              </div>
            </section>

            <section>
              <div className="mb-8 flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-3 font-headline text-2xl font-bold text-primary">
                  <MessageSquareQuote className="h-5 w-5 text-secondary" />
                  Student Testimonials
                </h2>
                <button className="text-sm font-bold text-secondary hover:underline">
                  View all 124 reviews
                </button>
              </div>

              <div className="space-y-8">
                {testimonials.map((testimonial) => (
                  <article
                    key={testimonial.name}
                    className="rounded-xl bg-surface-container-lowest p-8 shadow-[0px_4px_20px_rgba(0,51,88,0.04)]"
                  >
                    <div className="mb-4 flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={testimonial.name}
                        className="h-12 w-12 rounded-full object-cover"
                        src={testimonial.avatar}
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="font-bold text-primary">
                          {testimonial.name}
                        </h4>
                        <div className="flex gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Sparkles
                              key={index}
                              className="h-3.5 w-3.5 fill-current"
                            />
                          ))}
                        </div>
                      </div>
                      <time className="ml-auto text-xs font-medium text-on-surface-variant">
                        {testimonial.time}
                      </time>
                    </div>
                    <p className="italic leading-relaxed text-on-surface-variant">
                      &quot;{testimonial.quote}&quot;
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="self-start lg:col-span-4 lg:flex lg:justify-end">
            <div className="w-full max-w-[21rem] overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-lowest shadow-[0px_18px_36px_rgba(0,51,88,0.08)]">
              <div className="bg-primary p-5 text-on-primary">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="font-headline text-[2.2rem] font-black">$95</span>
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
                      November 2024
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
                          day.disabled
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
