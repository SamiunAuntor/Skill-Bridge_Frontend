"use client";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { UploadedImageResult } from "@/lib/upload-image";
import type { TutorEditableProfileResponse } from "@/types/tutor";
import { getTutorProfileValidationMessageForModal } from "./profileUtils";
import {
  AvailableDegreeOption,
  AvailableSubjectOption,
  modalPanelClass,
  ProfileFormState,
  TutorModalType,
} from "./shared";
import {
  BasicProfileForm,
  EducationForm,
  TeachingDetailsForm,
  UpdateFormState,
} from "./TutorProfileEditSections";

type TutorProfileEditModalProps = {
  activeModal: TutorModalType | null;
  availableDegrees: AvailableDegreeOption[];
  availableSubjects: AvailableSubjectOption[];
  errorMessage: string | null;
  formState: ProfileFormState;
  hasChanges: boolean;
  isSaving: boolean;
  isUploadingImage: boolean;
  onAddEducation: () => void;
  onCancel: () => void;
  onRemoveEducation: (index: number) => Promise<void>;
  pendingUploadedImage: UploadedImageResult | null;
  profileData: TutorEditableProfileResponse;
  setIsUploadingImage: (value: boolean) => void;
  setPendingUploadedImage: (value: UploadedImageResult | null) => void;
  updateFormState: UpdateFormState;
};

export default function TutorProfileEditModal({
  activeModal,
  availableDegrees,
  availableSubjects,
  errorMessage,
  formState,
  hasChanges,
  isSaving,
  isUploadingImage,
  onAddEducation,
  onCancel,
  onRemoveEducation,
  pendingUploadedImage,
  profileData,
  setIsUploadingImage,
  setPendingUploadedImage,
  updateFormState,
}: TutorProfileEditModalProps) {
  if (!activeModal) {
    return null;
  }

  const steps = useMemo(
    () =>
      [
        {
          key: "basic" as const,
          title: "Basic profile",
          description: "Update your public photo, professional title, and tutor bio.",
        },
        {
          key: "teaching" as const,
          title: "Teaching details",
          description:
            "Manage your categories, subjects, hourly rate, and experience.",
        },
        {
          key: "education" as const,
          title: "Education",
          description: "Add or update academic records shown on your public profile.",
        },
      ] satisfies Array<{
        key: TutorModalType;
        title: string;
        description: string;
      }>,
    []
  );

  const initialStepIndex = Math.max(
    0,
    steps.findIndex((step) => step.key === activeModal)
  );
  const [stepIndex, setStepIndex] = useState(initialStepIndex);
  const [stepError, setStepError] = useState<string | null>(null);

  useEffect(() => {
    setStepIndex(initialStepIndex);
    setStepError(null);
  }, [initialStepIndex]);

  const currentStep = steps[stepIndex] ?? steps[0];
  const isLastStep = stepIndex === steps.length - 1;
  const isFirstStep = stepIndex === 0;

  function validateStep(index: number): boolean {
    const step = steps[index];
    if (!step) return true;
    const message = getTutorProfileValidationMessageForModal(formState, step.key);
    setStepError(message);
    return !message;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-8">
      <div className={modalPanelClass}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-headline text-2xl font-bold text-primary">
              Complete your profile ({stepIndex + 1}/{steps.length})
            </h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              {currentStep.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onCancel()}
            disabled={isSaving || isUploadingImage}
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {steps.map((step, index) => {
            const isActive = index === stepIndex;
            return (
              <button
                key={step.key}
                type="button"
                disabled={isSaving || isUploadingImage}
                onClick={() => {
                  if (index > stepIndex && !validateStep(stepIndex)) {
                    return;
                  }
                  setStepError(null);
                  setStepIndex(index);
                }}
                className={`rounded-full px-4 py-2 text-[12px] font-bold transition ${
                  isActive
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-low text-on-surface-variant hover:text-primary"
                }`}
              >
                {step.title}
              </button>
            );
          })}
        </div>

        <div className="max-h-[70vh] overflow-hidden">
          <div
            className="flex w-full transition-transform duration-300"
            style={{ transform: `translateX(-${stepIndex * 100}%)` }}
          >
            <div className="w-full shrink-0 space-y-5 overflow-y-auto pr-1">
              <BasicProfileForm
                formState={formState}
                isSaving={isSaving}
                isUploadingImage={isUploadingImage}
                pendingUploadedImage={pendingUploadedImage}
                setIsUploadingImage={setIsUploadingImage}
                setPendingUploadedImage={setPendingUploadedImage}
                updateFormState={updateFormState}
              />
            </div>
            <div className="w-full shrink-0 space-y-5 overflow-y-auto pr-1">
              <TeachingDetailsForm
                availableSubjects={availableSubjects}
                formState={formState}
                isSaving={isSaving}
                profileData={profileData}
                updateFormState={updateFormState}
              />
            </div>
            <div className="w-full shrink-0 space-y-5 overflow-y-auto pr-1">
              <EducationForm
                availableDegrees={availableDegrees}
                formState={formState}
                isSaving={isSaving}
                onAddEducation={onAddEducation}
                onRemoveEducation={onRemoveEducation}
                profileData={profileData}
                updateFormState={updateFormState}
              />
            </div>
          </div>
        </div>

        {stepError ? (
          <div className="mt-5 rounded-xl bg-error-container px-4 py-3 text-[13px] text-on-error-container">
            {stepError}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-5 rounded-xl bg-error-container px-4 py-3 text-[13px] text-on-error-container">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => void onCancel()}
            disabled={isSaving || isUploadingImage}
            className="rounded-xl border border-outline-variant/25 bg-surface px-4 py-2.5 text-[13px] font-semibold text-primary transition hover:bg-surface-container-low disabled:opacity-60"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSaving || isUploadingImage || isFirstStep}
              onClick={() => {
                setStepError(null);
                setStepIndex((current) => Math.max(0, current - 1));
              }}
              className="rounded-xl border border-outline-variant/25 bg-surface px-4 py-2.5 text-[13px] font-semibold text-primary transition hover:bg-surface-container-low disabled:opacity-60"
            >
              Back
            </button>

            {!isLastStep ? (
              <button
                type="button"
                disabled={isSaving || isUploadingImage}
                onClick={() => {
                  if (!validateStep(stepIndex)) {
                    return;
                  }
                  setStepError(null);
                  setStepIndex((current) => Math.min(steps.length - 1, current + 1));
                }}
                className="rounded-xl bg-primary px-5 py-2.5 font-headline text-[13px] font-bold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSaving || isUploadingImage || !hasChanges}
                className="rounded-xl bg-primary px-5 py-2.5 font-headline text-[13px] font-bold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
