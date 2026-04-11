import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-8 text-center text-sm text-on-surface-variant">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
