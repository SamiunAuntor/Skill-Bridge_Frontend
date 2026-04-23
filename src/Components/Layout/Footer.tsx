"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Send, Star } from "lucide-react";
import { useAppAuthSession } from "@/lib/auth";
import {
  PlatformReviewApiError,
  submitPlatformReview,
} from "@/lib/platform-review-api";

const footerColumns = [
  {
    title: "Platform",
    links: [
      { label: "Find Tutors", href: "/tutors" },
      { label: "Subjects", href: "/subjects" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Become a Tutor", href: "/register?role=tutor" },
      { label: "Sign In", href: "/login" },
      { label: "Create Account", href: "/register" },
    ],
  },
];

export default function Footer() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const { data: session, isPending } = useAppAuthSession();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canReview = Boolean(session?.user);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canReview) {
      const result = await Swal.fire({
        icon: "info",
        title: "Sign in first",
        text: "Please sign in before sharing your platform review.",
        confirmButtonText: "Go to login",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonColor: "#1d3b66",
        cancelButtonColor: "#6b7280",
      });

      if (result.isConfirmed) {
        router.push("/login");
      }

      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitPlatformReview({
        rating,
        title: title.trim() || undefined,
        message,
      });
      setRating(5);
      setTitle("");
      setMessage("");
      router.refresh();
      await Swal.fire({
        icon: "success",
        title: result.action === "updated" ? "Review updated" : "Review published",
        text:
          result.action === "updated"
            ? "Your latest review is now visible to future learners."
            : "Thanks for helping future learners understand SkillBridge better.",
        confirmButtonColor: "#1d3b66",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Review not submitted",
        text:
          error instanceof PlatformReviewApiError
            ? error.message
            : "We couldn't submit your review right now.",
        confirmButtonColor: "#1d3b66",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <footer className="w-full border-t border-[#c1c7d0]/10 bg-[#003358] pt-16 text-white dark:bg-[#001d33] dark:text-[#d0e4ff]">
      <div className="mx-auto grid w-11/12 max-w-7xl grid-cols-1 gap-12 md:grid-cols-4">
        <div className="col-span-1">
          <span className="mb-4 block text-xl font-bold text-white">
            SkillBridge
          </span>
          <p className="mb-6 text-sm leading-relaxed text-[#c1c7d0]">
            Empowering learners through elite mentorship and architectural
            precision in education.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-white">
              {column.title}
            </h4>
            <ul className="space-y-4">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="block text-sm text-[#c1c7d0] transition-transform duration-300 hover:translate-x-1 hover:text-[#68fadd]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-white">
            Share a Review
          </h4>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-1" aria-label={`${rating} star rating`}>
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="rounded-md p-1 text-[#68fadd] transition hover:bg-white/10"
                    aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        value <= rating ? "fill-current" : ""
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={90}
              placeholder="Short title (optional)"
              className="w-full rounded-md border-none bg-white/10 px-4 py-2 text-sm text-white placeholder:text-[#c1c7d0]/60 focus:ring-1 focus:ring-[#68fadd]"
            />
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              minLength={20}
              maxLength={600}
              required
              rows={3}
              placeholder="Tell others about your experience"
              className="w-full resize-none rounded-md border-none bg-white/10 px-4 py-2 text-sm text-white placeholder:text-[#c1c7d0]/60 focus:ring-1 focus:ring-[#68fadd]"
            />
            <button
              type="submit"
              disabled={isSubmitting || isPending}
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-on-secondary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {isSubmitting
                ? "Publishing..."
                : isPending
                  ? "Checking..."
                  : "Publish Review"}
            </button>
            {!canReview && !isPending ? (
              <p className="text-xs leading-relaxed text-[#c1c7d0]/75">
                You can write now. We will ask you to sign in when you publish.
              </p>
            ) : null}
          </form>
        </div>
      </div>

      <div className="mt-16 w-full border-t border-white/10 px-4 py-8">
        <p className="text-center text-sm text-[#c1c7d0]">
          © {currentYear} SkillBridge. The Intellectual Architect.
        </p>
      </div>
    </footer>
  );
}
