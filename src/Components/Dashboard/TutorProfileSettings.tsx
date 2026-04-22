"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Camera, LoaderCircle } from "lucide-react";
import { useAppAuthSession } from "@/lib/auth";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";
import {
  getMyTutorProfile,
  TutorProfileApiError,
  updateMyTutorProfile,
} from "@/lib/tutor-profile-api";
import {
  deleteUploadedAsset,
  ImageUploadError,
  UploadedImageResult,
  uploadImage,
} from "@/lib/upload-image";
import { normalizeText } from "@/lib/text";
import type {
  TutorEditableDegreeOption,
  TutorEditableProfileResponse,
  TutorEditableSubjectOption,
  TutorProfileUpdateEducationInput,
  TutorProfileUpdateInput,
} from "@/types/tutor";

type ProfileFormState = TutorProfileUpdateInput;

const sectionCardClass =
  "rounded-[1.35rem] border border-outline-variant/25 bg-surface-container p-6 shadow-[0px_16px_40px_rgba(0,51,88,0.08)] dark:border-outline-variant/10 dark:bg-surface-container-low dark:shadow-[0px_12px_32px_rgba(0,0,0,0.24)]";

const inputClass =
  "w-full rounded-xl border border-outline-variant/30 bg-white px-3.5 py-2.5 text-[13px] text-on-surface shadow-sm shadow-slate-900/5 outline-none transition placeholder:text-[13px] focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-70 dark:border-outline-variant/30 dark:bg-surface-container dark:shadow-none";

const textAreaClass = `${inputClass} min-h-32 resize-y`;

function toFriendlyTutorProfileError(error: unknown): string {
  const message =
    error instanceof TutorProfileApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : "We couldn't update your tutor profile right now. Please try again.";

  if (/selected subjects must belong to the selected categories/i.test(message)) {
    return "One or more selected subjects do not belong to your selected categories.";
  }

  if (/one or more selected subjects are invalid/i.test(message)) {
    return "One or more selected subjects are no longer available. Please reselect them.";
  }

  if (/one or more selected categories are invalid/i.test(message)) {
    return "One or more selected categories are invalid. Please reselect them.";
  }

  if (/one or more selected degrees are invalid/i.test(message)) {
    return "One or more selected degrees are invalid. Please choose the degree again.";
  }

  if (/at least one subject is required/i.test(message)) {
    return "Please select at least one subject before saving your profile.";
  }

  if (/bio must be at least 20 characters long/i.test(message)) {
    return "Your bio must be at least 20 characters long.";
  }

  if (/education\[\d+\]\.institution/i.test(message)) {
    return "Each education entry needs an institution name.";
  }

  if (/education\[\d+\]\.degreeId/i.test(message)) {
    return "Each education entry must use one of the available degree options.";
  }

  if (/education\[\d+\]\.startYear cannot be greater than endYear/i.test(message)) {
    return "One education entry has a start year later than its end year.";
  }

  return message;
}

function createBlankEducation(
  defaultDegreeId?: string,
  degreeLabel?: string
): TutorProfileUpdateEducationInput {
  return {
    degreeId: defaultDegreeId ?? "",
    degree: degreeLabel ?? "",
    institution: "",
    fieldOfStudy: "",
    startYear: new Date().getFullYear(),
    endYear: null,
    description: "",
  };
}

function mapProfileToFormState(
  data: TutorEditableProfileResponse
): ProfileFormState {
  const defaultDegree = data.availableDegrees[0];

  return {
    profileImageUrl: data.profile.profileImageUrl,
    professionalTitle: data.profile.professionalTitle ?? "",
    bio: data.profile.bio ?? "",
    hourlyRate: data.profile.hourlyRate,
    experienceYears: data.profile.experienceYears,
    categoryIds: data.profile.categoryIds,
    subjectIds: data.profile.subjects.map((item) => item.subjectId),
    education:
      data.profile.education.length > 0
        ? data.profile.education.map((item) => ({
            id: item.id,
            degreeId: item.degreeId,
            degree: item.degree,
            institution: item.institution,
            fieldOfStudy: item.fieldOfStudy,
            startYear: item.startYear,
            endYear: item.endYear,
            description: item.description ?? "",
          }))
        : [createBlankEducation(defaultDegree?.id, defaultDegree?.name)],
  };
}

function serializeFormState(state: ProfileFormState): string {
  return JSON.stringify({
    profileImageUrl: state.profileImageUrl ?? null,
    professionalTitle: normalizeText(state.professionalTitle),
    bio: normalizeText(state.bio),
    hourlyRate: Number(state.hourlyRate) || 0,
    experienceYears: Number(state.experienceYears) || 0,
    categoryIds: [...state.categoryIds].sort(),
    subjectIds: [...state.subjectIds].sort(),
    education: state.education.map((item) => ({
      id: item.id ?? null,
      degreeId: item.degreeId,
      institution: normalizeText(item.institution),
      fieldOfStudy: normalizeText(item.fieldOfStudy),
      startYear: Number(item.startYear),
      endYear: item.endYear ?? null,
      description: normalizeText(item.description),
    })),
  });
}

function getCompletionRatio(completed: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

function resolveDegreeLabel(
  degreeId: string,
  options: TutorEditableDegreeOption[]
): string {
  return options.find((item) => item.id === degreeId)?.name ?? "";
}

function getAvailableSubjectsForSelection(
  selectedCategoryIds: string[],
  availableSubjects: TutorEditableSubjectOption[]
): TutorEditableSubjectOption[] {
  if (selectedCategoryIds.length === 0) {
    return [];
  }

  return availableSubjects.filter((subject) =>
    selectedCategoryIds.includes(subject.categoryId)
  );
}

export default function TutorProfileSettings() {
  const { data: session } = useAppAuthSession();
  const [profileData, setProfileData] = useState<TutorEditableProfileResponse | null>(
    null
  );
  const [formState, setFormState] = useState<ProfileFormState | null>(null);
  const [initialFormState, setInitialFormState] = useState<ProfileFormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingUploadedImage, setPendingUploadedImage] =
    useState<UploadedImageResult | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getMyTutorProfile();
        if (!isMounted) {
          return;
        }

        const mappedState = mapProfileToFormState(response);
        setProfileData(response);
        setFormState(mappedState);
        setInitialFormState(mappedState);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof TutorProfileApiError
            ? error.message
            : "Unable to load tutor profile."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const availableSubjects = useMemo(
    () =>
      profileData && formState
        ? getAvailableSubjectsForSelection(
            formState.categoryIds,
            profileData.availableSubjects
          )
        : [],
    [profileData, formState]
  );

  const completionStats = useMemo(() => {
    if (!formState) {
      return { completed: 0, total: 7 };
    }

    const checks = [
      Boolean(normalizeText(formState.profileImageUrl)),
      normalizeText(formState.professionalTitle).length > 0,
      normalizeText(formState.bio).length > 0,
      formState.hourlyRate > 0,
      formState.experienceYears > 0,
      formState.categoryIds.length > 0 && formState.subjectIds.length > 0,
      formState.education.some(
        (item) =>
          normalizeText(item.degreeId).length > 0 &&
          normalizeText(item.institution).length > 0
      ),
    ];

    return {
      completed: checks.filter(Boolean).length,
      total: checks.length,
    };
  }, [formState]);

  const hasChanges = useMemo(() => {
    if (!formState || !initialFormState) {
      return false;
    }

    return serializeFormState(formState) !== serializeFormState(initialFormState);
  }, [formState, initialFormState]);

  if (session?.user?.role && session.user.role !== "tutor") {
    return null;
  }

  const isInteractionDisabled = !isEditing || isSaving;

  function updateFormState(updater: (current: ProfileFormState) => ProfileFormState) {
    setFormState((current) => (current ? updater(current) : current));
  }

  async function rollbackPendingUploadedImage() {
    if (!pendingUploadedImage) {
      return;
    }

    try {
      await deleteUploadedAsset({
        publicId: pendingUploadedImage.publicId,
        resourceType: pendingUploadedImage.resourceType,
        deleteToken: pendingUploadedImage.deleteToken,
      });
    } catch (rollbackError) {
      console.warn("Unable to remove unsaved uploaded image.", rollbackError);
    } finally {
      setPendingUploadedImage(null);
    }
  }

  function handleStartEditing() {
    setErrorMessage(null);
    setIsEditing(true);
  }

  async function handleCancelEditing() {
    if (hasChanges) {
      const confirmation = await Swal.fire({
        icon: "warning",
        title: "Discard your changes?",
        text: "Any unsaved profile changes will be lost.",
        showCancelButton: true,
        confirmButtonText: "Discard changes",
        cancelButtonText: "Keep editing",
        confirmButtonColor: "#9f1d1d",
        cancelButtonColor: "#1d3b66",
      });

      if (!confirmation.isConfirmed) {
        return;
      }
    }

    await rollbackPendingUploadedImage();

    if (initialFormState) {
      setFormState(initialFormState);
    }
    setIsEditing(false);
    setErrorMessage(null);
  }

  async function handleRemoveEducation(index: number) {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Remove this education item?",
      text: "This academic record will be removed from your public tutoring profile.",
      showCancelButton: true,
      confirmButtonText: "Remove education",
      cancelButtonText: "Keep education",
      confirmButtonColor: "#9f1d1d",
      cancelButtonColor: "#1d3b66",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    updateFormState((current) => {
      const defaultDegree = profileData?.availableDegrees[0];

      return {
        ...current,
        education:
          current.education.length > 1
            ? current.education.filter((_, educationIndex) => educationIndex !== index)
            : [createBlankEducation(defaultDegree?.id, defaultDegree?.name)],
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formState || !isEditing || !profileData) {
      return;
    }

    if (!hasChanges) {
      return;
    }

    if (normalizeText(formState.bio).length < 20) {
      await Swal.fire({
        icon: "warning",
        title: "Bio is too short",
        text: "Please write at least 20 characters so students get a meaningful introduction.",
        confirmButtonColor: "#1d3b66",
      });
      return;
    }

    if (formState.subjectIds.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "Select at least one subject",
        text: "Students need to know exactly which subjects you teach.",
        confirmButtonColor: "#1d3b66",
      });
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const normalizedPayload: TutorProfileUpdateInput = {
        profileImageUrl: formState.profileImageUrl,
        professionalTitle: normalizeText(formState.professionalTitle),
        bio: normalizeText(formState.bio),
        hourlyRate: Number(formState.hourlyRate) || 0,
        experienceYears: Number(formState.experienceYears) || 0,
        categoryIds: formState.categoryIds,
        subjectIds: formState.subjectIds,
        education: formState.education
          .map((item) => ({
            ...(item.id ? { id: item.id } : {}),
            degreeId: item.degreeId,
            degree: resolveDegreeLabel(item.degreeId, profileData.availableDegrees),
            institution: normalizeText(item.institution),
            fieldOfStudy: normalizeText(item.fieldOfStudy),
            startYear: Number(item.startYear),
            ...(item.endYear ? { endYear: Number(item.endYear) } : {}),
            description: normalizeText(item.description),
          }))
          .filter((item) => item.degreeId && item.institution.length > 0),
      };

      const response = await updateMyTutorProfile(normalizedPayload);
      const mappedState = mapProfileToFormState(response);
      setProfileData(response);
      setFormState(mappedState);
      setInitialFormState(mappedState);
      setPendingUploadedImage(null);
      setIsEditing(false);

      await Swal.fire({
        icon: "success",
        title: "Profile updated",
        text: "Your tutor profile changes have been saved successfully.",
        confirmButtonColor: "#1d3b66",
      });
    } catch (error) {
      if (pendingUploadedImage) {
        await rollbackPendingUploadedImage();
        if (initialFormState) {
          updateFormState((current) => ({
            ...current,
            profileImageUrl: initialFormState.profileImageUrl,
          }));
        }
      }

      await Swal.fire({
        icon: "error",
        title: "Profile update failed",
        text: toFriendlyTutorProfileError(error),
        confirmButtonColor: "#1d3b66",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <DashboardPageLoader label="Loading tutor profile..." />;
  }

  if (!formState || !profileData) {
    return (
      <section className="rounded-[1.75rem] bg-error-container p-8 text-on-error-container">
        <h2 className="font-headline text-2xl font-bold">Profile unavailable</h2>
        <p className="mt-3">{errorMessage || "Tutor profile could not be loaded."}</p>
      </section>
    );
  }

  const completionPercentage = getCompletionRatio(
    completionStats.completed,
    completionStats.total
  );

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <section className="rounded-[1.55rem] border border-outline-variant/25 bg-surface-container p-6 shadow-[0px_16px_40px_rgba(0,51,88,0.08)] dark:border-outline-variant/10 dark:bg-surface-container-low dark:shadow-[0px_12px_32px_rgba(0,0,0,0.24)]">
        <div className="grid gap-5 lg:grid-cols-[0.3fr_0.7fr]">
          <article className="rounded-[1.35rem] border border-outline-variant/20 bg-surface-container-lowest p-5">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-surface-container-highest shadow-sm">
                {formState.profileImageUrl ? (
                  <img
                    alt="Tutor profile preview"
                    className="h-full w-full object-cover"
                    src={formState.profileImageUrl}
                  />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                    account_circle
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-headline text-[1.35rem] font-bold text-primary">
                  Profile Photo
                </h3>
                <p className="mt-1 text-[12px] text-on-surface-variant">
                  Upload a clear tutor headshot.
                </p>
              </div>

              <label
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold transition ${
                  isInteractionDisabled || isUploadingImage
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
                  disabled={isInteractionDisabled || isUploadingImage}
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";

                    if (!file) {
                      return;
                    }

                    setErrorMessage(null);
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
                          console.warn(
                            "Unable to remove replaced uploaded image.",
                            rollbackError
                          );
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
          </article>

          <div className="rounded-[1.35rem] border border-outline-variant/20 bg-surface-container-lowest p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="font-headline text-[1.7rem] font-extrabold tracking-tight text-primary">
                  Build your public tutoring identity
                </h2>
                <p className="mt-1.5 text-[12px] text-on-surface-variant">
                  Set up the information students will see on your public profile.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={handleStartEditing}
                    className="rounded-xl bg-primary px-5 py-2.5 font-headline text-[13px] font-bold text-on-primary transition hover:opacity-90"
                  >
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => void handleCancelEditing()}
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
                  </>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-primary-fixed/40 p-4">
              <div className="flex items-center justify-between text-[12px] font-semibold text-primary">
                <span>
                  Completion {completionStats.completed}/{completionStats.total}
                </span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/70">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {errorMessage ? (
              <div className="mt-4 rounded-xl bg-error-container px-4 py-3 text-[13px] text-on-error-container">
                {errorMessage}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <div className="space-y-6">
          <article className={sectionCardClass}>
            <h3 className="font-headline text-[1.35rem] font-bold text-primary">
              Professional Summary
            </h3>

            <div className="mt-5 space-y-2">
              <label
                className="block text-[13px] font-semibold text-on-surface"
                htmlFor="professionalTitle"
              >
                Professional Title
              </label>
              <input
                id="professionalTitle"
                className={inputClass}
                disabled={isInteractionDisabled}
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

            <div className="mt-5 space-y-2">
              <label className="block text-[13px] font-semibold text-on-surface" htmlFor="bio">
                Bio
              </label>
              <textarea
                id="bio"
                className={textAreaClass}
                disabled={isInteractionDisabled}
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
          </article>

          <article className={sectionCardClass}>
            <h3 className="font-headline text-[1.35rem] font-bold text-primary">
              Teaching Details
            </h3>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-[13px] font-semibold text-on-surface" htmlFor="rate">
                  Hourly Rate ($)
                </label>
                <input
                  id="rate"
                  min={0}
                  step="1"
                  type="number"
                  className={inputClass}
                  disabled={isInteractionDisabled}
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
                <label
                  className="block text-[13px] font-semibold text-on-surface"
                  htmlFor="experience"
                >
                  Experience Years
                </label>
                <input
                  id="experience"
                  min={0}
                  step="1"
                  type="number"
                  className={inputClass}
                  disabled={isInteractionDisabled}
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

            <div className="mt-5 space-y-3">
              <label className="block text-[13px] font-semibold text-on-surface">
                Categories
              </label>
              <div className="flex flex-wrap gap-3">
                {profileData.availableCategories.map((category) => {
                  const isSelected = formState.categoryIds.includes(category.id);

                  return (
                    <button
                      key={category.id}
                      type="button"
                      disabled={isInteractionDisabled}
                      onClick={() =>
                        updateFormState((current) => {
                          const nextCategoryIds = isSelected
                            ? current.categoryIds.filter((id) => id !== category.id)
                            : [...current.categoryIds, category.id];
                          const allowedSubjectIds = profileData.availableSubjects
                            .filter((subject) =>
                              nextCategoryIds.includes(subject.categoryId)
                            )
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

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <label className="block text-[13px] font-semibold text-on-surface">
                  Subjects
                </label>
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
                                  disabled={isInteractionDisabled}
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
          </article>
        </div>

        <article className={sectionCardClass}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-headline text-[1.35rem] font-bold text-primary">
              Education
            </h3>
            <button
              type="button"
              hidden={!isEditing}
              disabled={isInteractionDisabled}
              onClick={() => {
                const defaultDegree = profileData.availableDegrees[0];

                updateFormState((current) => ({
                  ...current,
                  education: [
                    createBlankEducation(defaultDegree?.id, defaultDegree?.name),
                    ...current.education,
                  ],
                }));
              }}
              className="rounded-xl bg-primary px-4 py-2 text-[13px] font-bold text-on-primary"
            >
              Add Education
            </button>
          </div>

          <div className="mt-5 space-y-4">
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
                      Degree
                    </label>
                    <select
                      className={inputClass}
                      disabled={isInteractionDisabled}
                      value={item.degreeId}
                      onChange={(event) =>
                        updateFormState((current) => ({
                          ...current,
                          education: current.education.map((educationItem, educationIndex) =>
                            educationIndex === index
                              ? {
                                  ...educationItem,
                                  degreeId: event.target.value,
                                  degree: resolveDegreeLabel(
                                    event.target.value,
                                    profileData.availableDegrees
                                  ),
                                }
                              : educationItem
                          ),
                        }))
                      }
                    >
                      <option value="">Select degree</option>
                      {profileData.availableDegrees.map((degree) => (
                        <option key={degree.id} value={degree.id}>
                          {degree.name}
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
                      disabled={isInteractionDisabled}
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

                  <div className="space-y-2">
                    <label className="block text-[13px] font-semibold text-on-surface">
                      Field of Study
                    </label>
                    <input
                      className={inputClass}
                      disabled={isInteractionDisabled}
                      value={item.fieldOfStudy ?? ""}
                      onChange={(event) =>
                        updateFormState((current) => ({
                          ...current,
                          education: current.education.map((educationItem, educationIndex) =>
                            educationIndex === index
                              ? { ...educationItem, fieldOfStudy: event.target.value }
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
                        disabled={isInteractionDisabled}
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
                        disabled={isInteractionDisabled}
                        value={item.endYear ?? ""}
                        onChange={(event) =>
                          updateFormState((current) => ({
                            ...current,
                            education: current.education.map((educationItem, educationIndex) =>
                              educationIndex === index
                                ? {
                                    ...educationItem,
                                    endYear: event.target.value
                                      ? Number(event.target.value)
                                      : null,
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
                      disabled={isInteractionDisabled}
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
                  hidden={!isEditing}
                  disabled={isInteractionDisabled}
                  onClick={() => void handleRemoveEducation(index)}
                  className="mt-5 w-full rounded-xl border border-error-container bg-error-container/50 px-4 py-3 text-[13px] font-semibold text-on-error-container"
                >
                  Remove Education
                </button>
              </article>
            ))}
          </div>
        </article>
      </section>
    </form>
  );
}
