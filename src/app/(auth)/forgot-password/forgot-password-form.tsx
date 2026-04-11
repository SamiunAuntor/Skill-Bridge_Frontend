"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { formatAuthError } from "@/lib/auth-errors";

const forgotSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

const fieldClass = (invalid: boolean) =>
  `w-full rounded-md border-none bg-surface-container-highest px-4 py-3 text-on-surface focus:ring-2 focus:ring-surface-tint/40 ${
    invalid ? "ring-2 ring-red-400/70" : ""
  }`;

export default function ForgotPasswordForm() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      const { error: err } = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) {
        setApiError(err.message || "Something went wrong.");
        return;
      }
      setDone(true);
    } catch (e) {
      setApiError(formatAuthError(e));
    }
  });

  if (done) {
    return (
      <div
        className="rounded-lg bg-secondary-fixed/40 px-4 py-3 text-sm text-on-secondary-fixed"
        role="status"
      >
        If an account exists for that email, we sent reset instructions. Check
        your inbox and spam folder.
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      {apiError && (
        <div
          className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          {apiError}
        </div>
      )}
      <div className="space-y-2">
        <label
          className="block text-sm font-medium text-on-surface"
          htmlFor="forgot-email"
        >
          Email
        </label>
        <input
          id="forgot-email"
          autoComplete="email"
          className={fieldClass(!!errors.email)}
          placeholder="name@atheneum.edu"
          type="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-700">{errors.email.message}</p>
        )}
      </div>
      <button
        className="signature-cta w-full rounded-md py-4 font-headline text-lg font-bold tracking-tight text-on-primary transition-all duration-300 hover:shadow-lg disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
