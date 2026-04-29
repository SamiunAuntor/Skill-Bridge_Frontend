import Link from "next/link";
import ForgotPasswordForm from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="space-y-2 text-center lg:hidden">
        <h1 className="text-2xl font-bold text-primary">Forgot password</h1>
        <p className="text-sm text-on-surface-variant">
          We&apos;ll email you a link to reset your password.
        </p>
      </div>

      <div className="rounded-xl border border-red-300/70 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
        Demo deployment note: password reset email delivery is currently unavailable
        on the free hosting tier because outbound SMTP/Nodemailer mail is not
        supported yet.
      </div>

      <ForgotPasswordForm />

      <p className="text-center text-sm text-on-surface-variant">
        <Link className="font-bold text-primary hover:underline" href="/login">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
