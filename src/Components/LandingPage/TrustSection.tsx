"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Quote, CheckCircle2, Star } from "lucide-react";
import avatarImage from "@/assets/avatar.png";

type PlatformReview = {
  id: string;
  rating: number;
  title: string | null;
  message: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
};

const trustPoints = [
  { title: "Identity & Degree Verification", description: "We manually verify all academic credentials." },
  { title: "Teaching Simulation", description: "Tutors must pass a live teaching evaluation." },
  { title: "Ongoing Performance Review", description: "Student feedback loops keep standards exceptional." },
];

export default function TrustSection({
  platformReviews = [],
}: {
  platformReviews?: PlatformReview[];
}) {
  const safePlatformReviews = Array.isArray(platformReviews)
    ? platformReviews
    : [];
  const testimonials = safePlatformReviews.map((review) => ({
    quote: review.message,
    author: review.user.name,
    role: review.title || "SkillBridge learner",
    rating: review.rating,
    avatarUrl: review.user.avatarUrl,
  }));

  return (
    <section className="bg-surface py-24">
      <div className="mx-auto grid w-11/12 max-w-7xl grid-cols-1 items-center gap-20 lg:grid-cols-2">

        {/* Left Side : Testimonial Slider */}
        <div className="relative w-full overflow-hidden rounded-3xl">
          <div className="absolute -top-10 -left-10 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />

          {testimonials.length > 0 ? (
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              autoplay={{ delay: 5000 }}
              pagination={{ clickable: true }}
              className="pb-12 overflow-hidden rounded-3xl"
            >
              {testimonials.map((item, index) => (
                <SwiperSlide key={index} className="overflow-hidden rounded-3xl">
                  <div className="relative z-10 rounded-3xl bg-surface-container-lowest p-10 shadow-[0px_12px_32px_rgba(0,51,88,0.06)] md:p-14">
                    <Quote className="mb-6 h-12 w-12 text-secondary opacity-20" />

                    <p className="mb-8 font-headline text-xl font-medium italic leading-relaxed text-primary md:text-2xl">
                      &quot;{item.quote}&quot;
                    </p>

                    <div className="flex items-center gap-4">
                      {item.avatarUrl ? (
                        <img
                          src={item.avatarUrl}
                          alt=""
                          className="h-14 w-14 rounded-full object-cover shadow-sm"
                        />
                      ) : (
                        <Image
                          src={avatarImage}
                          alt=""
                          className="h-14 w-14 rounded-full object-cover shadow-sm"
                        />
                      )}
                      <div>
                        <h4 className="font-headline font-bold text-primary">{item.author}</h4>
                        <p className="text-sm text-on-surface-variant">{item.role}</p>
                        <div className="mt-1 flex gap-0.5 text-secondary">
                          {Array.from({ length: 5 }, (_, starIndex) => (
                            <Star
                              key={starIndex}
                              className={`h-3.5 w-3.5 ${
                                starIndex < item.rating ? "fill-current" : ""
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="relative z-10 rounded-3xl bg-surface-container-lowest p-10 shadow-[0px_12px_32px_rgba(0,51,88,0.06)] md:p-14">
              <Quote className="mb-6 h-12 w-12 text-secondary opacity-20" />
              <p className="font-headline text-xl font-medium leading-relaxed text-primary md:text-2xl">
                Platform reviews will appear here after learners share their
                experience.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Image
                  src={avatarImage}
                  alt=""
                  className="h-14 w-14 rounded-full object-cover shadow-sm"
                />
                <div>
                  <h4 className="font-headline font-bold text-primary">
                    SkillBridge community
                  </h4>
                  <p className="text-sm text-on-surface-variant">
                    Waiting for the first review
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side : Trust Content */}
        <div className="space-y-10">
          <div className="space-y-4">
            <h2 className="font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
              The Sanctuary for <span className="text-secondary">Focused Growth</span>
            </h2>
            <p className="text-lg leading-relaxed text-on-surface-variant">
              We prioritize quality over quantity. Every tutor undergoes a
              rigorous three-stage verification process to ensure they meet our
              standard of Intellectual Architect.
            </p>
          </div>

          <ul className="space-y-6">
            {trustPoints.map((point) => (
              <li key={point.title} className="flex items-start gap-4">
                <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-secondary" />
                <div>
                  <h4 className="font-headline font-bold text-primary">{point.title}</h4>
                  <p className="text-on-surface-variant">
                    {point.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
