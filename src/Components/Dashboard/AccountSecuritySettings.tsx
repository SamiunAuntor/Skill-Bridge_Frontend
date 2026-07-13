"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { z } from "zod";
import PasswordVisibilityToggle from "@/Components/Auth/PasswordVisibilityToggle";
import { changePasswordWithAppAuth } from "@/lib/auth";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(128, "Password must be 128 characters or fewer.")
      .regex(/[a-z]/, "Include at least one lowercase letter.")
      .regex(/[A-Z]/, "Include at least one uppercase letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .superRefine((values, context) => {
    if (values.currentPassword === values.newPassword) {
      context.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "Your new password must be different from the current one.",
      });
    }

    if (values.newPassword !== values.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "The passwords do not match.",
      });
    }
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const inputClass = (invalid: boolean) =>
  `h-12 w-full rounded-xl border bg-surface-container-low px-4 pr-12 text-sm text-on-surface outline-none transition focus:ring-2 focus:ring-primary/20 ${
    invalid
      ? "border-error/70 focus:border-error"
      : "border-outline-variant/30 focus:border-primary"
  }`;

export default function AccountSecuritySettings() {
  const router = useRouter();
  const [visible, setVisible] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");
  const strengthChecks = [
    { label: "8+ characters", met: newPassword.length >= 8 },
    { label: "Uppercase", met: /[A-Z]/.test(newPassword) },
    { label: "Lowercase", met: /[a-z]/.test(newPassword) },
    { label: "Number", met: /[0-9]/.test(newPassword) },
  ];

  const onSubmit = handleSubmit(async (values) => {
    try {
      await changePasswordWithAppAuth({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset();
      await Swal.fire({
        icon: "success",
        title: "Password updated",
        text: "For your security, all sessions were signed out. Please sign in with your new password.",
        confirmButtonColor: "#1d3b66",
      });
      router.replace("/login");
      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Password update failed",
        text:
          error instanceof Error
            ? error.message
            : "Unable to update your password right now.",
        confirmButtonColor: "#1d3b66",
      });
    }
  });

  const fields = [
    {
      name: "currentPassword" as const,
      label: "Current password",
      autoComplete: "current-password",
      visibleKey: "current" as const,
    },
    {
      name: "newPassword" as const,
      label: "New password",
      autoComplete: "new-password",
      visibleKey: "next" as const,
    },
    {
      name: "confirmPassword" as const,
      label: "Confirm new password",
      autoComplete: "new-password",
      visibleKey: "confirm" as const,
    },
  ];

  return (
    <section className="rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-[0_18px_40px_rgba(0,51,88,0.08)] sm:p-6">
      <div className="flex items-start gap-4">
        <span className="theme-primary-soft-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
          <ShieldCheck aria-hidden="true" className="h-6 w-6" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Account security
          </p>
          <h2 className="mt-1 font-headline text-2xl font-bold text-primary">
            Change password
          </h2>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            Updating your password signs out every active session, including this one.
          </p>
        </div>
      </div>

      <form className="mt-6 max-w-2xl space-y-5" onSubmit={onSubmit} noValidate>
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label
              htmlFor={`security-${field.name}`}
              className="block text-sm font-semibold text-on-surface"
            >
              {field.label}
            </label>
            <div className="relative">
              <input
                id={`security-${field.name}`}
                type={visible[field.visibleKey] ? "text" : "password"}
                autoComplete={field.autoComplete}
                disabled={isSubmitting}
                className={inputClass(Boolean(errors[field.name]))}
                {...register(field.name)}
              />
              <PasswordVisibilityToggle
                visible={visible[field.visibleKey]}
                onToggle={() =>
                  setVisible((current) => ({
                    ...current,
                    [field.visibleKey]: !current[field.visibleKey],
                  }))
                }
              />
            </div>
            {errors[field.name] ? (
              <p role="alert" className="text-sm text-error">
                {errors[field.name]?.message}
              </p>
            ) : null}
          </div>
        ))}

        <div aria-label="Password requirements" className="flex flex-wrap gap-2">
          {strengthChecks.map((check) => (
            <span
              key={check.label}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                check.met
                  ? "bg-secondary/15 text-secondary"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {check.label}
            </span>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <KeyRound aria-hidden="true" className="h-4 w-4" />
          {isSubmitting ? "Updating password..." : "Update password"}
        </button>
      </form>
    </section>
  );
}
