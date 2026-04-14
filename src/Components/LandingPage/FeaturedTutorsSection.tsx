import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";

const featuredTutors = [
  {
    name: "Dr. Helena Vance",
    subject: "Quantum Physics",
    rating: "5.0",
    rate: "$85/hr",
    description:
      "With over 15 years in theoretical physics and research at leading universities, Helena simplifies the most complex cosmic mysteries into digestible lessons.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBJ7kDrvY2XbPHgdOH-hNVSU8ZvfWDtwZeG7xpwbvt996H7HGPzVUSJyZPR2eVIQYL3feqmkSTkhLvwN3ALj5m-YLMTtNi0idNw7RihbarWuLkIaYw_rlxqgrmbuOsDLe3uu9i6D3BU8237f6DMlb5RL__3pP0SrR-ZXjdO-p67paqdStps2gGY_Ds-wjtJoGYncE488NCfNNPhKfzRhmcgOoyfj1kuvSptycQdr9k431goDawlsAt1Sq1yZvLgTLrZ6Tkjh14EEVw",
  },
  {
    name: "Marcus Thorne",
    subject: "UX Design",
    rate: "$60/hr",
    description:
      "Lead Designer at top Silicon Valley firms, focusing on human-centric digital interfaces.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB3NC0vFi23DLWrkkVw6JGF5L4xbSlqjGXYJ1Jzwr6yz19mV4o66MsDXTCso2vXNmvS22fb6WA3jW0ZTBAcXHGJPl5bD9WIRyeIj69n-XCNYZgHc_W2bngI9yDSL6s2qV6HG19NInXy9NzgW79Fg_u6ANudfXh5YcCgL0hH1GYPbK03vzp-PU0ElUf95X75644vAY0JsfXGIqpxKnArsz1WJIP2A0t8pWRE4jZJCSJVdFjDNWiHWU_LFQYIzj9OYv52ENtcjFuoDKk",
  },
  {
    name: "Sophia Chen",
    subject: "Business Strategy",
    rate: "$110/hr",
    description:
      "Former McKinsey consultant helping entrepreneurs scale their vision through data-driven insight.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA1LgxO6MqNNtBKm0nrISBG5JH9_pvKhW1lGyZmWTjKzkvqi68ZqEe_s3vfEZaO7wM-s6H5PfqywZofbOuXkFRTnSQYdcMQMBbJ1fbkeTGH1T924gHoMiHyiN4uT9VIZznhsbPBA-nebLrdXSdvvSO9YdMaLX_EUBayHEJYdWWYaO2xTb2w8MG6nSmd7ars1LHguJqk5OzolmEFlo-tIcwO3qX6HVk0s8K5S-CQ_I3NbYYWkBucre6o0xRG1MdgsSdkX-PFBvwQUsU",
  },
];

export default function FeaturedTutorsSection() {
  const [leadTutor, secondTutor, thirdTutor] = featuredTutors;

  return (
    <section className="bg-surface py-24">
      <div className="mx-auto w-11/12 max-w-7xl">
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="mb-4 text-4xl font-bold text-primary">
              Learn from the <span className="text-secondary">Best Minds</span>
            </h2>
            <p className="text-lg text-on-surface-variant">
              Our top-rated tutors are vetted for both expertise and teaching
              excellence. Experience the difference of premium mentorship.
            </p>
          </div>
          <Link
            href="/tutors"
            className="group flex items-center gap-2 font-bold text-primary transition-all hover:gap-4"
          >
            Browse all tutors
            <span className="material-symbols-outlined">arrow_right_alt</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="group flex cursor-pointer flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0px_12px_32px_rgba(0,51,88,0.06)] transition-colors hover:bg-surface-container-high md:col-span-2 md:flex-row">
            <div className="aspect-square md:w-2/5 md:aspect-auto">
              <img alt="" className="h-full w-full object-cover" src={leadTutor.image} />
            </div>
            <div className="flex flex-col justify-center p-8 md:w-3/5">
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-full bg-tertiary-fixed px-3 py-1 text-xs font-bold uppercase text-on-tertiary-fixed-variant">
                  {leadTutor.subject}
                </span>
                <div className="ml-auto flex text-secondary">
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    star
                  </span>
                  <span className="ml-1 text-sm font-bold text-primary">
                    {leadTutor.rating}
                  </span>
                </div>
              </div>
              <h3 className="mb-2 text-2xl font-bold text-primary">
                {leadTutor.name}
              </h3>
              <p className="mb-6 line-clamp-3 text-on-surface-variant">
                {leadTutor.description}
              </p>
              <div className="mt-auto flex items-center gap-4">
                <div className="text-sm">
                  <p className="text-[10px] font-bold uppercase text-outline-variant">
                    Rate
                  </p>
                  <p className="font-bold text-primary">{leadTutor.rate}</p>
                </div>
                <Link
                  href="/tutors"
                  className="ml-auto rounded-md bg-primary px-6 py-2 text-sm font-bold text-on-primary opacity-0 transition-opacity group-hover:opacity-100"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>

          <div className="group cursor-pointer rounded-xl bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)] transition-colors hover:bg-surface-container-high">
            <div className="mx-auto mb-6 h-24 w-24 overflow-hidden rounded-full">
              <img alt="" className="h-full w-full object-cover" src={secondTutor.image} />
            </div>
            <div className="text-center">
              <span className="mb-3 inline-block rounded-full bg-tertiary-fixed px-3 py-1 text-[10px] font-bold uppercase text-on-tertiary-fixed-variant">
                {secondTutor.subject}
              </span>
              <h3 className="mb-1 text-xl font-bold text-primary">
                {secondTutor.name}
              </h3>
              <div className="mb-4 flex justify-center text-secondary">
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
              <p className="mb-6 line-clamp-2 text-sm text-on-surface-variant">
                {secondTutor.description}
              </p>
              <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
                <span className="font-bold text-primary">{secondTutor.rate}</span>
                <span className="material-symbols-outlined text-primary transition-transform group-hover:translate-x-2">
                  arrow_forward
                </span>
              </div>
            </div>
          </div>

          <div className="group cursor-pointer rounded-xl bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)] transition-colors hover:bg-surface-container-high">
            <div className="mx-auto mb-6 h-24 w-24 overflow-hidden rounded-full">
              <img alt="" className="h-full w-full object-cover" src={thirdTutor.image} />
            </div>
            <div className="text-center">
              <span className="mb-3 inline-block rounded-full bg-tertiary-fixed px-3 py-1 text-[10px] font-bold uppercase text-on-tertiary-fixed-variant">
                {thirdTutor.subject}
              </span>
              <h3 className="mb-1 text-xl font-bold text-primary">
                {thirdTutor.name}
              </h3>
              <div className="mb-4 flex justify-center text-secondary">
                {Array.from({ length: 4 }).map((_, index) => (
                  <span
                    key={index}
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    star
                  </span>
                ))}
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  star_half
                </span>
              </div>
              <p className="mb-6 line-clamp-2 text-sm text-on-surface-variant">
                {thirdTutor.description}
              </p>
              <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
                <span className="font-bold text-primary">{thirdTutor.rate}</span>
                <span className="material-symbols-outlined text-primary transition-transform group-hover:translate-x-2">
                  arrow_forward
                </span>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-primary-container p-10 shadow-sm transition-all duration-300 md:col-span-2 md:p-14">
            <div className="relative z-10 flex flex-col gap-8">
              <div className="max-w-3xl space-y-4">
                <h3 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                  Want to <span className="text-secondary">Teach?</span>
                </h3>

                <p className="text-lg leading-relaxed text-on-primary-container/90 md:text-xl">
                  Join our elite roster of intellectuals and share your
                  expertise with motivated students globally. We are looking for
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
