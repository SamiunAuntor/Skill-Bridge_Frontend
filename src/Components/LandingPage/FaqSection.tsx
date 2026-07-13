const questions = [
  {
    question: "How do I choose a tutor?",
    answer:
      "Use the tutor directory to search by subject and narrow the results by category, hourly rate, and other available filters. Each tutor profile includes expertise, ratings, reviews, and available session times.",
  },
  {
    question: "How are sessions booked?",
    answer:
      "Open a tutor profile, choose the subject and an available time slot, then follow the secure checkout flow. Your upcoming and completed sessions remain available in your student dashboard.",
  },
  {
    question: "Can I manage my bookings from my account?",
    answer:
      "Yes. Signed-in students can review session details and notifications from their dashboard, while tutors can manage availability, sessions, reviews, and finances from theirs.",
  },
  {
    question: "Can students leave tutor reviews?",
    answer:
      "Students can submit feedback for eligible completed sessions. Ratings and reviews help future learners make informed decisions and help tutors improve their service.",
  },
];

export default function FaqSection() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="bg-surface px-6 py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">
            Frequently asked questions
          </p>
          <h2
            id="faq-heading"
            className="mt-4 font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl"
          >
            Everything you need to start learning
          </h2>
          <p className="mt-5 text-lg leading-8 text-on-surface-variant">
            Clear answers about finding tutors, booking live sessions, and
            managing your learning experience.
          </p>
        </div>

        <div className="space-y-4">
          {questions.map((item, index) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-6 py-1 shadow-[0_8px_24px_rgba(0,51,88,0.05)]"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-headline text-lg font-bold text-primary marker:content-none">
                {item.question}
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-xl text-primary transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="border-t border-outline-variant/30 py-5 leading-7 text-on-surface-variant">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
