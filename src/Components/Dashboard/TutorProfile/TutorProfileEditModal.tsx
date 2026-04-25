"use client";
import { X } from "lucide-react";
import { UploadedImageResult } from "@/lib/upload-image";
import type { TutorEditableProfileResponse } from "@/types/tutor";
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

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-8">
      <div className={modalPanelClass}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-headline text-2xl font-bold text-primary">
              {activeModal === "basic"
                ? "Edit Basic Profile"
                : activeModal === "teaching"
                  ? "Edit Teaching Details"
                  : "Manage Education"}
            </h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              {activeModal === "basic"
                ? "Update your public photo, professional title, and tutor bio."
                : activeModal === "teaching"
                  ? "Manage your categories, subjects, hourly rate, and experience."
                  : "Add or update academic records shown on your public profile."}
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

        <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
          {activeModal === "basic" ? (
            <BasicProfileForm
              formState={formState}
              isSaving={isSaving}
              isUploadingImage={isUploadingImage}
              pendingUploadedImage={pendingUploadedImage}
              setIsUploadingImage={setIsUploadingImage}
              setPendingUploadedImage={setPendingUploadedImage}
              updateFormState={updateFormState}
            />
          ) : null}

          {activeModal === "teaching" ? (
            <TeachingDetailsForm
              availableSubjects={availableSubjects}
              formState={formState}
              isSaving={isSaving}
              profileData={profileData}
              updateFormState={updateFormState}
            />
          ) : null}

          {activeModal === "education" ? (
            <EducationForm
              availableDegrees={availableDegrees}
              formState={formState}
              isSaving={isSaving}
              onAddEducation={onAddEducation}
              onRemoveEducation={onRemoveEducation}
              profileData={profileData}
              updateFormState={updateFormState}
            />
          ) : null}

          {errorMessage ? (
            <div className="rounded-xl bg-error-container px-4 py-3 text-[13px] text-on-error-container">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => void onCancel()}
            disabled={isSaving || isUploadingImage}
            className="rounded-xl border border-outline-variant/25 bg-surface px-4 py-2.5 text-[13px] font-semibold text-primary transition hover:bg-surface-container-low disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || isUploadingImage || !hasChanges}
            className="rounded-xl bg-primary px-5 py-2.5 font-headline text-[13px] font-bold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
