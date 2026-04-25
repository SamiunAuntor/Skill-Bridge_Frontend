import Swal from "sweetalert2";
import { Camera, LoaderCircle } from "lucide-react";
import {
  deleteUploadedAsset,
  ImageUploadError,
  UploadedImageResult,
  uploadImage,
} from "@/lib/upload-image";
import type { TutorEditableProfileResponse } from "@/types/tutor";
import {
  AvailableDegreeOption,
  AvailableSubjectOption,
  inputClass,
  ProfileFormState,
  textAreaClass,
} from "./shared";

export type UpdateFormState = (
  updater: (current: ProfileFormState) => ProfileFormState
) => void;

export function BasicProfileForm({
  formState,
  isSaving,
  isUploadingImage,
  pendingUploadedImage,
  setIsUploadingImage,
  setPendingUploadedImage,
  updateFormState,
}: {
  formState: ProfileFormState;
  isSaving: boolean;
  isUploadingImage: boolean;
  pendingUploadedImage: UploadedImageResult | null;
  setIsUploadingImage: (value: boolean) => void;
  setPendingUploadedImage: (value: UploadedImageResult | null) => void;
  updateFormState: UpdateFormState;
}) {
  return (
    <>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-surface-container-highest shadow-sm">
          {formState.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="Tutor profile preview"
              className="h-full w-full object-cover"
              src={formState.profileImageUrl}
            />
          ) : (
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">
              account_circle
            </span>
          )}
        </div>

        <label
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold transition ${
            isUploadingImage
              ? "cursor-not-allowed bg-surface-container-high text-on-surface-variant opacity-70"
              : "cursor-pointer bg-primary text-on-primary hover:opacity-90"
          }`}
        >
          {isUploadingImage ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
          <span>{isUploadingImage ? "Uploading..." : "Upload New Image"}</span>
          <input
            className="sr-only"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={isUploadingImage || isSaving}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";

              if (!file) {
                return;
              }

              setIsUploadingImage(true);

              try {
                const result = await uploadImage(file);
                if (pendingUploadedImage) {
                  try {
                    await deleteUploadedAsset({
                      publicId: pendingUploadedImage.publicId,
                      resourceType: pendingUploadedImage.resourceType,
                      deleteToken: pendingUploadedImage.deleteToken,
                    });
                  } catch (rollbackError) {
                    console.warn("Unable to remove replaced uploaded image.", rollbackError);
                  }
                }

                setPendingUploadedImage(result);
                updateFormState((current) => ({
                  ...current,
                  profileImageUrl: result.secureUrl,
                }));
              } catch (error) {
                await Swal.fire({
                  icon: "error",
                  title: "Image upload failed",
                  text:
                    error instanceof ImageUploadError
                      ? error.message
                      : "We couldn't upload this profile image right now. Please try again.",
                  confirmButtonColor: "#1d3b66",
                });
              } finally {
                setIsUploadingImage(false);
              }
            }}
          />
        </label>
      </div>

      <div className="space-y-2">
        <label
          className="block text-[13px] font-semibold text-on-surface"
          htmlFor="professionalTitle"
        >
          Professional Title
        </label>
        <input
          id="professionalTitle"
          className={inputClass}
          required
          disabled={isSaving}
          value={formState.professionalTitle}
          onChange={(event) =>
            updateFormState((current) => ({
              ...current,
              professionalTitle: event.target.value,
            }))
          }
          placeholder="Senior Researcher & Lecturer"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-[13px] font-semibold text-on-surface" htmlFor="bio">
          Bio
        </label>
        <textarea
          id="bio"
          className={textAreaClass}
          minLength={20}
          disabled={isSaving}
          value={formState.bio}
          onChange={(event) =>
            updateFormState((current) => ({
              ...current,
              bio: event.target.value,
            }))
          }
          placeholder="I help students master complex topics through structured, practical sessions."
        />
      </div>
    </>
  );
}

export function TeachingDetailsForm({
  availableSubjects,
  formState,
  isSaving,
  profileData,
  updateFormState,
}: {
  availableSubjects: AvailableSubjectOption[];
  formState: ProfileFormState;
  isSaving: boolean;
  profileData: TutorEditableProfileResponse;
  updateFormState: UpdateFormState;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-[13px] font-semibold text-on-surface" htmlFor="rate">
            Hourly Rate ($)
          </label>
          <input
            id="rate"
            min={1}
            step="1"
            type="number"
            className={inputClass}
            disabled={isSaving}
            value={formState.hourlyRate}
            onChange={(event) =>
              updateFormState((current) => ({
                ...current,
                hourlyRate: Number(event.target.value),
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[13px] font-semibold text-on-surface" htmlFor="experience">
            Experience Years
          </label>
          <input
            id="experience"
            min={0}
            step="1"
            type="number"
            className={inputClass}
            disabled={isSaving}
            value={formState.experienceYears}
            onChange={(event) =>
              updateFormState((current) => ({
                ...current,
                experienceYears: Number(event.target.value),
              }))
            }
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-[13px] font-semibold text-on-surface">Categories</label>
        <div className="flex flex-wrap gap-3">
          {profileData.availableCategories.map((category) => {
            const isSelected = formState.categoryIds.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                disabled={isSaving}
                onClick={() =>
                  updateFormState((current) => {
                    const nextCategoryIds = isSelected
                      ? current.categoryIds.filter((id) => id !== category.id)
                      : [...current.categoryIds, category.id];
                    const allowedSubjectIds = profileData.availableSubjects
                      .filter((subject) => nextCategoryIds.includes(subject.categoryId))
                      .map((subject) => subject.id);

                    return {
                      ...current,
                      categoryIds: nextCategoryIds,
                      subjectIds: current.subjectIds.filter((subjectId) =>
                        allowedSubjectIds.includes(subjectId)
                      ),
                    };
                  })
                }
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isSelected
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-white text-on-surface-variant shadow-sm hover:text-primary"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <label className="block text-[13px] font-semibold text-on-surface">Subjects</label>
          <p className="text-[11px] text-on-surface-variant">
            Select subjects under your chosen categories.
          </p>
        </div>

        {formState.categoryIds.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-lowest px-4 py-5 text-sm text-on-surface-variant">
            Choose at least one category first to unlock its subjects.
          </div>
        ) : availableSubjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-lowest px-4 py-5 text-sm text-on-surface-variant">
            No active subjects are available under the selected categories yet.
          </div>
        ) : (
          <div className="space-y-4">
            {profileData.availableCategories
              .filter((category) => formState.categoryIds.includes(category.id))
              .map((category) => {
                const categorySubjects = availableSubjects.filter(
                  (subject) => subject.categoryId === category.id
                );

                if (categorySubjects.length === 0) {
                  return null;
                }

                return (
                  <div
                    key={category.id}
                    className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4"
                  >
                    <h4 className="text-[12px] font-bold uppercase tracking-[0.18em] text-primary">
                      {category.name}
                    </h4>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {categorySubjects.map((subject) => {
                        const isSelected = formState.subjectIds.includes(subject.id);

                        return (
                          <button
                            key={subject.id}
                            type="button"
                            disabled={isSaving}
                            onClick={() =>
                              updateFormState((current) => ({
                                ...current,
                                subjectIds: isSelected
                                  ? current.subjectIds.filter((id) => id !== subject.id)
                                  : [...current.subjectIds, subject.id],
                              }))
                            }
                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                              isSelected
                                ? "border-primary bg-primary-fixed text-primary"
                                : "border-outline-variant/20 bg-white text-on-surface-variant hover:border-primary/30 hover:text-primary"
                            }`}
                          >
                            <div className="text-sm font-bold">{subject.name}</div>
                            {subject.description ? (
                              <div className="mt-1 text-[11px] leading-relaxed">
                                {subject.description}
                              </div>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </>
  );
}

export function EducationForm({
  availableDegrees,
  formState,
  isSaving,
  onAddEducation,
  onRemoveEducation,
  profileData,
  updateFormState,
}: {
  availableDegrees: AvailableDegreeOption[];
  formState: ProfileFormState;
  isSaving: boolean;
  onAddEducation: () => void;
  onRemoveEducation: (index: number) => Promise<void>;
  profileData: TutorEditableProfileResponse;
  updateFormState: UpdateFormState;
}) {
  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          disabled={isSaving}
          onClick={onAddEducation}
          className="rounded-xl bg-primary px-4 py-2 text-[13px] font-bold text-on-primary"
        >
          Add Education
        </button>
      </div>

      <div className="space-y-4">
        {formState.education.map((item, index) => (
          <article
            key={item.id ?? `education-${index}`}
            className="rounded-2xl border border-outline-variant/25 bg-white p-5 shadow-sm shadow-slate-900/5 dark:border-outline-variant/20 dark:bg-surface-container dark:shadow-none"
          >
            <p className="text-[13px] font-bold text-primary">
              Education History {index + 1}
            </p>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="block text-[13px] font-semibold text-on-surface">
                  Education Category
                </label>
                <select
                  className={inputClass}
                  disabled={isSaving}
                  value={item.categoryId}
                  onChange={(event) =>
                    updateFormState((current) => ({
                      ...current,
                      education: current.education.map((educationItem, educationIndex) =>
                        educationIndex === index
                          ? {
                              ...educationItem,
                              categoryId: event.target.value,
                              degreeId: "",
                            }
                          : educationItem
                      ),
                    }))
                  }
                >
                  <option value="">Select education category</option>
                  {profileData.availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-semibold text-on-surface">
                  Degree
                </label>
                <select
                  className={inputClass}
                  disabled={isSaving}
                  value={item.degreeId}
                  onChange={(event) =>
                    updateFormState((current) => ({
                      ...current,
                      education: current.education.map((educationItem, educationIndex) =>
                        educationIndex === index
                          ? {
                              ...educationItem,
                              degreeId: event.target.value,
                            }
                          : educationItem
                      ),
                    }))
                  }
                >
                  <option value="">Select degree</option>
                  {availableDegrees
                    .filter((degree) =>
                      item.categoryId ? degree.categoryId === item.categoryId : false
                    )
                    .map((degree) => (
                      <option key={degree.id} value={degree.id}>
                        {degree.name} - {degree.categoryName}
                        {degree.level ? ` (${degree.level})` : ""}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-semibold text-on-surface">
                  Institution
                </label>
                <input
                  className={inputClass}
                  disabled={isSaving}
                  value={item.institution}
                  onChange={(event) =>
                    updateFormState((current) => ({
                      ...current,
                      education: current.education.map((educationItem, educationIndex) =>
                        educationIndex === index
                          ? { ...educationItem, institution: event.target.value }
                          : educationItem
                      ),
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[13px] font-semibold text-on-surface">
                    Start Year
                  </label>
                  <input
                    min={1900}
                    max={3000}
                    type="number"
                    className={inputClass}
                    disabled={isSaving}
                    value={item.startYear}
                    onChange={(event) =>
                      updateFormState((current) => ({
                        ...current,
                        education: current.education.map((educationItem, educationIndex) =>
                          educationIndex === index
                            ? {
                                ...educationItem,
                                startYear: Number(event.target.value),
                              }
                            : educationItem
                        ),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[13px] font-semibold text-on-surface">
                    End Year
                  </label>
                  <input
                    min={1900}
                    max={3000}
                    type="number"
                    className={inputClass}
                    disabled={isSaving}
                    value={item.endYear ?? ""}
                    onChange={(event) =>
                      updateFormState((current) => ({
                        ...current,
                        education: current.education.map((educationItem, educationIndex) =>
                          educationIndex === index
                            ? {
                                ...educationItem,
                                endYear: event.target.value ? Number(event.target.value) : null,
                              }
                            : educationItem
                        ),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-semibold text-on-surface">
                  Description
                </label>
                <textarea
                  className={`${inputClass} min-h-24 resize-y`}
                  disabled={isSaving}
                  value={item.description ?? ""}
                  onChange={(event) =>
                    updateFormState((current) => ({
                      ...current,
                      education: current.education.map((educationItem, educationIndex) =>
                        educationIndex === index
                          ? { ...educationItem, description: event.target.value }
                          : educationItem
                      ),
                    }))
                  }
                />
              </div>
            </div>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => void onRemoveEducation(index)}
              className="mt-5 w-full rounded-xl border border-error-container bg-error-container/50 px-4 py-3 text-[13px] font-semibold text-on-error-container"
            >
              Remove Education
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
