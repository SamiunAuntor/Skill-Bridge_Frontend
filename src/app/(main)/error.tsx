"use client";

import { useEffect } from "react";
import StateCard from "@/Components/Shared/StateCard";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[main-route-error]", error);
  }, [error]);

  return (
    <div className="mx-auto w-11/12 max-w-[1440px] py-10">
      <StateCard
        title="This page could not be loaded"
        description={error.message || "Please try again in a moment."}
        tone="error"
        action={
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary"
          >
            Try again
          </button>
        }
      />
    </div>
  );
}
