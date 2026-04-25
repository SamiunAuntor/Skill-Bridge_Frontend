import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="px-8 py-24">
      <div className="relative mx-auto w-11/12 max-w-5xl overflow-hidden rounded-3xl bg-primary-container p-12 text-center md:p-20">
        <div className="relative z-10">
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Ready to bridge the <span className="text-secondary">gap?</span>
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-on-primary-container md:text-xl">
            Start your journey today with a 15-minute free consultation with
            any of our featured tutors.
          </p>
          <div className="relative z-20 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/tutors"
              className="relative z-20 rounded-md bg-secondary px-10 py-4 text-center font-bold text-on-secondary shadow-lg transition-transform hover:scale-105"
            >
              Get Started Now
            </Link>
            <Link
              href="/subjects"
              className="relative z-20 rounded-md bg-primary px-10 py-4 text-center font-bold text-on-primary transition-all hover:opacity-90"
            >
              Explore Subjects
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-24 -bottom-24 h-64 w-64 rounded-full border-[32px] border-secondary/20" />
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full border-[48px] border-secondary/10" />
      </div>
    </section>
  );
}
