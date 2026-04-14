"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { tutorSortLabels } from "@/lib/tutor-api";
import { TutorSortOption } from "@/types/tutor";

type TutorSortSelectProps = {
  value: TutorSortOption;
};

export default function TutorSortSelect({ value }: TutorSortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const options = useMemo(() => Object.entries(tutorSortLabels), []);

  return (
    <label className="flex items-center gap-3 text-sm text-on-surface-variant">
      <span>Sort by:</span>
      <select
        value={value}
        disabled={isPending}
        onChange={(event) =>
          startTransition(() => {
            const nextParams = new URLSearchParams(searchParams.toString());
            nextParams.set("sortBy", event.target.value);
            nextParams.delete("page");
            router.push(`${pathname}?${nextParams.toString()}`, {
              scroll: false,
            });
          })
        }
        className="rounded-xl border-none bg-transparent pr-2 font-bold text-primary focus:ring-0"
      >
        {options.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
