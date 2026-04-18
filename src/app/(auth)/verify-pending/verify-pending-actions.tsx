"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { betterAuthClient } from "@/lib/auth/better-auth-client";
import {
  showAuthErrorToast,
  showAuthSuccessToast,
} from "@/lib/auth-alerts";
import { formatAuthError } from "@/lib/auth-errors";

const verifySchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

const fieldClass = (invalid: boolean) =>
  `w-full rounded-md border-none bg-surface-container-highest px-4 py-3 text-on-surface focus:ring-2 focus:ring-surface-tint/40 ${
    invalid ? "ring-2 ring-red-400/70" : ""
  }`;

export default function VerifyPendingActions() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email")?.trim() ?? "";

  const [status, setStatus] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { email: emailParam },
  });

  useEffect(() => {
    reset({ email: emailParam });
  }, [emailParam, reset]);

  const onResend = handleSubmit(async (values) => {
    setApiError(null);
    setStatus(null);
    try {
      const { error: err } = await betterAuthClient.sendVerificationEmail({
        email: values.email,
        callbackURL: `${window.location.origin}/login?verified=1`,
      });
      if (err) {
        setApiError(err.message || "Could not send email.");
        await showAuthErrorToast(
          "Verification email failed",
          err.message || "Could not send email."
        );
        return;
      }
      setStatus("Verification email sent. Check your inbox.");
      await showAuthSuccessToast(
        "Verification email sent",
        "Check your inbox for the new verification link."
      );
    } catch (e) {
      const message = formatAuthError(e);
      setApiError(message);
      await showAuthErrorToast("Verification email failed", message);
    }
  });

  return (
    <form className="space-y-4" onSubmit={onResend} noValidate>
      <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
        Resend verification
      </label>
      <input
        className={fieldClass(!!errors.email)}
        placeholder="you@example.com"
        type="email"
        autoComplete="email"
        {...register("email")}
      />
      {errors.email && (
        <p className="text-sm text-red-700">{errors.email.message}</p>
      )}
      <button
        className="signature-cta w-full rounded-md py-3 font-headline text-sm font-bold tracking-tight text-on-primary transition-all duration-300 hover:shadow-lg disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Sending…" : "Resend verification email"}
      </button>
      {status && (
        <p className="text-sm text-secondary" role="status">
          {status}
        </p>
      )}
      {apiError && (
        <p className="text-sm text-red-800" role="alert">
          {apiError}
        </p>
      )}
    </form>
  );
}
