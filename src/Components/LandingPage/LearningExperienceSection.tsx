import { BellRing, CreditCard, LayoutDashboard, ShieldCheck } from "lucide-react";

const features = [
  {
    title: "Secure checkout",
    description: "Complete session payments through the platform's protected Stripe checkout flow.",
    icon: CreditCard,
  },
  {
    title: "One learning hub",
    description: "Keep upcoming sessions, completed lessons, profile details, and reviews in one dashboard.",
    icon: LayoutDashboard,
  },
  {
    title: "Timely updates",
    description: "Receive account and session notifications without losing track of important activity.",
    icon: BellRing,
  },
  {
    title: "Trusted profiles",
    description: "Compare tutor expertise, subjects, ratings, and learner feedback before booking.",
    icon: ShieldCheck,
  },
];

export default function LearningExperienceSection() {
  return (
    <section
      aria-labelledby="learning-experience-heading"
      className="bg-surface px-6 py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid items-end gap-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">
              Built around every session
            </p>
            <h2
              id="learning-experience-heading"
              className="mt-4 font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl"
            >
              A connected learning experience
            </h2>
          </div>
          <p className="max-w-xl text-lg leading-8 text-on-surface-variant lg:justify-self-end">
            SkillBridge brings discovery, booking, session management, and
            feedback together so learners can focus on making progress.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-7 shadow-[0_10px_28px_rgba(0,51,88,0.05)]"
              >
                <span className="theme-secondary-soft flex h-12 w-12 items-center justify-center rounded-2xl">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <h3 className="mt-6 text-xl font-bold text-primary">
                  {feature.title}
                </h3>
                <p className="mt-3 leading-7 text-on-surface-variant">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
