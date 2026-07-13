import { CalendarDays, CircleDollarSign, MessageSquareText, UserRoundCheck } from "lucide-react";
import Link from "next/link";

const benefits = [
  { label: "Build a professional tutor profile", icon: UserRoundCheck },
  { label: "Set and manage weekly availability", icon: CalendarDays },
  { label: "Track sessions and finances", icon: CircleDollarSign },
  { label: "Grow through verified learner reviews", icon: MessageSquareText },
];

export default function TutorOpportunitySection() {
  return (
    <section
      aria-labelledby="tutor-opportunity-heading"
      className="bg-surface-container-low px-6 py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto grid w-full max-w-7xl overflow-hidden rounded-3xl bg-primary-container lg:grid-cols-[1.05fr_0.95fr]">
        <div className="p-8 sm:p-12 lg:p-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary-fixed">
            For educators
          </p>
          <h2
            id="tutor-opportunity-heading"
            className="mt-4 font-headline text-4xl font-extrabold tracking-tight text-white md:text-5xl"
          >
            Turn your expertise into meaningful learning
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-on-primary-container">
            Create a tutor account, present your subject expertise, organize
            your availability, and manage the teaching journey from a dedicated
            dashboard.
          </p>
          <Link
            href="/register"
            className="mt-9 inline-flex rounded-md bg-secondary-fixed px-7 py-3.5 font-bold text-on-secondary-fixed shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Register as a tutor
          </Link>
        </div>

        <div className="grid gap-4 bg-primary p-8 sm:grid-cols-2 sm:p-12 lg:grid-cols-1 lg:p-16">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.label}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-5 text-white"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-fixed text-on-secondary-fixed">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <p className="font-semibold leading-6">{benefit.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
