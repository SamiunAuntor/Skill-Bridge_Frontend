import type {
  TutorEditableProfileResponse,
  TutorEditableSubjectOption,
  TutorProfileUpdateEducationInput,
  TutorProfileUpdateInput,
} from "@/types/tutor";

export type ProfileFormState = TutorProfileUpdateInput;
export type TutorModalType = "basic" | "teaching" | "education";
export type AvailableDegreeOption = TutorEditableProfileResponse["availableDegrees"][number];
export type AvailableSubjectOption = TutorEditableSubjectOption;
export type EducationItem = TutorProfileUpdateEducationInput;

export const sectionCardClass =
  "rounded-[1.35rem] border border-outline-variant/25 bg-surface-container p-6 shadow-[0px_16px_40px_rgba(0,51,88,0.08)] dark:border-outline-variant/10 dark:bg-surface-container-low dark:shadow-[0px_12px_32px_rgba(0,0,0,0.24)]";

export const inputClass =
  "w-full rounded-xl border border-outline-variant/30 bg-white px-3.5 py-2.5 text-[13px] text-on-surface shadow-sm shadow-slate-900/5 outline-none transition placeholder:text-[13px] focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-70 dark:border-outline-variant/30 dark:bg-surface-container dark:shadow-none";

export const textAreaClass = `${inputClass} min-h-32 resize-y`;

export const modalPanelClass =
  "w-full max-w-3xl rounded-[1.6rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0px_24px_60px_rgba(0,0,0,0.24)]";
