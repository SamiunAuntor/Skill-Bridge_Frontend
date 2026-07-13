import { CalendarCheck2, Search, Video } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Find the right tutor",
    description:
      "Search by subject, expertise, rating, and hourly rate to compare tutors who match your learning goals.",
    icon: Search,
  },
  {
    number: "02",
    title: "Choose a time",
    description:
      "Review live availability, select a suitable session, and complete your booking through secure checkout.",
    icon: CalendarCheck2,
  },
  {
    number: "03",
    title: "Learn live",
    description:
      "Join your scheduled one-to-one session, build practical skills, and share feedback when it is complete.",
    icon: Video,
  },
];

export default function HowItWorksSection() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="bg-surface-container-low px-6 py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">
            A simple learning journey
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-4 font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl"
          >
            How SkillBridge works
          </h2>
          <p className="mt-5 text-lg leading-8 text-on-surface-variant">
            Go from discovering an expert to attending a focused live session
            in three clear steps.
          </p>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <li
                key={step.number}
                className="relative rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-8 shadow-[0_12px_32px_rgba(0,51,88,0.06)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary">
                    <Icon aria-hidden="true" className="h-7 w-7" />
                  </span>
                  <span className="font-headline text-4xl font-black text-outline-variant/60">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-8 text-2xl font-bold text-primary">
                  {step.title}
                </h3>
                <p className="mt-3 leading-7 text-on-surface-variant">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
