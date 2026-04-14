"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

const upcomingSessions = [
  {
    id: "session-1",
    month: "Oct",
    day: "24",
    title: "Advanced Calculus",
    student: "Elena Rodriguez",
    time: "14:00 - 15:30",
    mode: "Virtual Class",
    icon: "video_call",
  },
  {
    id: "session-2",
    month: "Oct",
    day: "25",
    title: "Organic Chemistry I",
    student: "Marcus Chen",
    time: "09:00 - 11:00",
    mode: "In-Person",
    icon: "map",
  },
  {
    id: "session-3",
    month: "Oct",
    day: "25",
    title: "Quantum Mechanics",
    student: "Sarah Jenkins",
    time: "16:30 - 18:00",
    mode: "Virtual Class",
    icon: "video_call",
  },
];

const recentFeedback = [
  {
    id: "review-1",
    student: "Elena Rodriguez",
    subject: "Calculus III",
    comment:
      "Julian has a unique way of breaking down complex theorems. I finally feel confident for my finals!",
  },
  {
    id: "review-2",
    student: "Marcus Chen",
    subject: "Chemistry",
    comment:
      "Great session today. The analogies used for organic synthesis were incredibly helpful.",
  },
  {
    id: "review-3",
    student: "Sarah Jenkins",
    subject: "Physics",
    comment:
      "Highly knowledgeable and patient. Dr. Vance makes physics feel like a puzzle rather than a chore.",
  },
];

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function TutorDashboardHome() {
  const { data: session } = authClient.useSession();
  const role = session?.user?.role;

  if (role !== "tutor") {
    return (
      <section className="rounded-[1.5rem] bg-surface-container-low p-8">
        <h2 className="font-headline text-2xl font-bold text-primary">
          Dashboard setup is ready
        </h2>
        <p className="mt-3 max-w-2xl text-on-surface-variant">
          This shared dashboard shell is now role-aware. Tutor-specific widgets are
          shown here, and student/admin sections can plug into the same layout next.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-10">
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <article className="relative overflow-hidden rounded-[1.5rem] bg-primary px-8 py-8 text-on-primary-container xl:col-span-2">
          <p className="text-sm font-medium text-on-primary-container/80">
            Total Earnings
          </p>
          <h2 className="mt-2 font-headline text-5xl font-extrabold text-white">
            $12,480.00
          </h2>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-secondary-fixed">
            <span className="material-symbols-outlined text-base">trending_up</span>
            +14.2% from last month
          </div>
          <span className="material-symbols-outlined absolute bottom-4 right-5 text-[8rem] text-white/10">
            payments
          </span>
        </article>

        <article className="rounded-[1.5rem] bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)]">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-fixed text-primary">
            <span className="material-symbols-outlined">history_edu</span>
          </div>
          <p className="text-sm font-medium text-on-surface-variant">Hours Taught</p>
          <h3 className="mt-1 font-headline text-3xl font-bold text-primary">
            342.5
          </h3>
          <p className="mt-2 text-xs text-on-surface-variant">Target: 400h</p>
        </article>

        <article className="rounded-[1.5rem] bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)]">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              star
            </span>
          </div>
          <p className="text-sm font-medium text-on-surface-variant">Average Rating</p>
          <h3 className="mt-1 font-headline text-3xl font-bold text-primary">
            4.92
          </h3>
          <p className="mt-2 text-xs text-on-surface-variant">from 128 reviews</p>
        </article>
      </section>

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[2fr_1fr]">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-3xl font-bold text-primary">
              Upcoming Sessions
            </h2>
            <Link
              href="/dashboard/sessions"
              className="text-sm font-bold text-secondary hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingSessions.map((sessionItem) => (
              <article
                key={sessionItem.id}
                className="group flex items-center justify-between rounded-2xl bg-surface-container-lowest p-5 transition-colors duration-300 hover:bg-primary-fixed"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl border border-outline-variant/10 bg-surface-container-low text-primary">
                    <span className="text-[11px] font-bold uppercase">
                      {sessionItem.month}
                    </span>
                    <span className="font-headline text-xl font-black leading-none">
                      {sessionItem.day}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline text-xl font-bold text-on-surface">
                      {sessionItem.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-base">
                        person
                      </span>
                      {sessionItem.student} • {sessionItem.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-tertiary-fixed px-3 py-1 text-xs font-semibold text-on-tertiary-fixed-variant">
                    {sessionItem.mode}
                  </span>
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container text-primary transition-colors group-hover:bg-primary group-hover:text-white"
                  >
                    <span className="material-symbols-outlined">
                      {sessionItem.icon}
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="font-headline text-3xl font-bold text-primary">
            Availability
          </h2>

          <article className="space-y-6 rounded-[1.5rem] bg-surface-container-low p-8">
            <div>
              <p className="mb-3 text-sm font-bold text-on-surface">Profile Status</p>
              <div className="flex items-center gap-3 rounded-xl bg-surface-container-lowest p-4">
                <span className="h-3 w-3 rounded-full bg-secondary-fixed shadow-[0_0_8px_rgba(104,250,221,0.8)]" />
                <span className="text-sm font-medium text-on-surface">
                  Tutor profile can be completed from the availability and profile pages
                </span>
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold text-on-surface">
                  Weekly Load
                </span>
                <span className="text-xs font-medium text-on-surface-variant">
                  28 / 40 hrs
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-container-highest">
                <div className="h-full w-[70%] bg-primary" />
              </div>
            </div>
          </article>

          <div className="flex flex-wrap gap-2">
            {["STEM Specialist", "PhD Mentor", "Top 1% Tutor"].map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-tertiary-fixed px-3 py-1 text-xs font-medium text-on-tertiary-fixed-variant"
              >
                {chip}
              </span>
            ))}
          </div>
        </section>
      </div>

      <section className="space-y-6">
        <h2 className="font-headline text-3xl font-bold text-primary">
          Recent Feedback
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {recentFeedback.map((review) => (
            <article
              key={review.id}
              className="space-y-4 rounded-2xl bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-black text-on-primary">
                    {getInitials(review.student)}
                  </div>
                  <div>
                    <h3 className="font-headline text-sm font-bold text-on-surface">
                      {review.student}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                      {review.subject}
                    </p>
                  </div>
                </div>

                <div className="flex text-secondary-fixed-dim">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span
                      key={index}
                      className="material-symbols-outlined text-sm"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      star
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-sm italic text-on-surface-variant">
                &quot;{review.comment}&quot;
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
