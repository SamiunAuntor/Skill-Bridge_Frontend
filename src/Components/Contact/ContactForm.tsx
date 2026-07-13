"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { z } from "zod";
import { submitContact } from "@/lib/contact-api";

const schema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters.").max(80),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  subject: z.string().trim().min(3, "Enter at least 3 characters.").max(120),
  message: z.string().trim().min(20, "Enter at least 20 characters.").max(2000),
  website: z.string().max(200).optional(),
});

type Values = z.infer<typeof schema>;
const inputClass = (invalid: boolean) =>
  `w-full rounded-xl border bg-surface-container-low px-4 py-3 text-on-surface outline-none transition focus:ring-2 focus:ring-primary/20 ${invalid ? "border-error" : "border-outline-variant/30 focus:border-primary"}`;

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", subject: "", message: "", website: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await submitContact(values);
      reset();
      await Swal.fire({
        icon: "success",
        title: "Message received",
        text: "Thanks for contacting SkillBridge. We will review your message soon.",
        confirmButtonText: "Done",
        confirmButtonColor: "#1d3b66",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Message not sent",
        text:
          error instanceof Error
            ? error.message
            : "Unable to send your message right now.",
        confirmButtonText: "Try again",
        confirmButtonColor: "#1d3b66",
      });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" id="contact-name" error={errors.name?.message}>
          <input id="contact-name" required autoComplete="name" className={inputClass(!!errors.name)} {...register("name")} />
        </Field>
        <Field label="Email" id="contact-email" error={errors.email?.message}>
          <input id="contact-email" required type="email" autoComplete="email" className={inputClass(!!errors.email)} {...register("email")} />
        </Field>
      </div>
      <Field label="Subject" id="contact-subject" error={errors.subject?.message}>
        <input id="contact-subject" required className={inputClass(!!errors.subject)} {...register("subject")} />
      </Field>
      <Field label="Message" id="contact-message" error={errors.message?.message}>
        <textarea id="contact-message" required rows={7} className={`${inputClass(!!errors.message)} resize-y`} {...register("message")} />
      </Field>
      <div className="absolute -left-[10000px]" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-bold text-on-primary transition hover:opacity-90 disabled:opacity-60 sm:w-auto">
        <Send className="h-4 w-4" /> {isSubmitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-on-surface">
        {label} <span className="text-error" aria-hidden="true">*</span>
        <span className="sr-only"> (required)</span>
      </label>
      {children}
      {error ? <p role="alert" className="text-sm text-error">{error}</p> : null}
    </div>
  );
}
