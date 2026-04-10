"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Quote, CheckCircle2 } from "lucide-react";

const testimonials = [
  {
    quote: "SkillBridge didn't just find me a tutor; it found me a mentor who understood my specific learning style. My progress tripled in just one semester.",
    author: "Sandra Reed",
    role: "Graduate Student, Stanford",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
  },
  {
    quote: "The vetting process here is visible in the quality of instruction. My mentor provided clarity on complex architectural principles that I couldn't find elsewhere.",
    author: "Liam Chen",
    role: "Architecture Undergraduate, NUS",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
  },
  {
    quote: "The personalized approach to learning is a game-changer. I went from struggling with macroeconomics to leading my study group thanks to my tutor.",
    author: "Elena Rodriguez",
    role: "Economics Major, LSE",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
  },
];

const trustPoints = [
  { title: "Identity & Degree Verification", description: "We manually verify all academic credentials." },
  { title: "Teaching Simulation", description: "Tutors must pass a live teaching evaluation." },
  { title: "Ongoing Performance Review", description: "Student feedback loops keep standards exceptional." },
];

export default function TrustSection() {
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto grid w-11/12 max-w-7xl grid-cols-1 items-center gap-20 lg:grid-cols-2">

        {/* Left Side : Testimonial Slider */}
        <div className="relative w-full overflow-hidden rounded-3xl">
          <div className="absolute -top-10 -left-10 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />

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
                    <img
                      src={item.image}
                      alt={item.author}
                      className="h-14 w-14 rounded-full object-cover shadow-sm"
                    />
                    <div>
                      <h4 className="font-headline font-bold text-primary">{item.author}</h4>
                      <p className="text-sm text-on-surface-variant">{item.role}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
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