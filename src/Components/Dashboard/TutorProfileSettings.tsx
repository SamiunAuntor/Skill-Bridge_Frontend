"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import { GraduationCap, PencilLine, Save, Sparkles, Wallet, X } from "lucide-react";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";
import {
  BasicProfileForm,
  EducationForm,
  TeachingDetailsForm,
} from "@/Components/Dashboard/TutorProfile/TutorProfileEditSections";
import { type ProfileFormState, sectionCardClass } from "@/Components/Dashboard/TutorProfile/shared";
import {
  createBlankEducation,
  getAvailableSubjectsForSelection,
  getCompletionRatio,
  getTutorProfileValidationMessage,
  mapProfileToFormState,
  serializeFormState,
  toFriendlyTutorProfileError,
} from "@/Components/Dashboard/TutorProfile/profileUtils";
import StateCard from "@/Components/Shared/StateCard";
import {
  getMyTutorProfile,
  TutorProfileApiError,
  updateMyTutorProfile,
} from "@/lib/tutor-profile-api";
import { deleteUploadedAsset, type UploadedImageResult } from "@/lib/upload-image";
import { normalizeText } from "@/lib/text";
import type {
  TutorEditableProfileEducation,
  TutorEditableProfileResponse,
  TutorProfileUpdateInput,
} from "@/types/tutor";

function DetailList({
  items,
  emptyLabel,
  tone = "primary",
}: {
  items: string[];
  emptyLabel: string;
  tone?: "primary" | "neutral";
}) {
  if (items.length === 0) {
    return <p className="text-sm text-on-surface-variant">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
            tone === "primary"
              ? "border border-primary/15 bg-surface-container-high text-primary"
              : "border border-outline-variant/20 bg-surface text-on-surface-variant"
          }`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">
        {label}
      </p>
      <div>{value}</div>
    </div>
  );
}

function EducationSummary({
  education,
  availableDegrees,
}: {
  education: TutorEditableProfileEducation[];
  availableDegrees: TutorEditableProfileResponse["availableDegrees"];
}) {
  if (education.length === 0) {
    return <p className="text-sm text-on-surface-variant">No education added yet.</p>;
  }

  return (
    <div className="space-y-3">
      {education.map((item) => {
        const degree = availableDegrees.find((entry) => entry.id === item.degreeId);

        return (
          <article
            key={item.id}
            className="rounded-2xl border border-outline-variant/20 bg-surface p-4"
          >
            <p className="text-sm font-bold text-primary">
              {degree?.name ?? "Education"}
            </p>
            <p className="mt-1 text-sm text-on-surface">{item.institution}</p>
            <p className="mt-1 text-[12px] text-on-surface-variant">
              {item.startYear}
              {item.endYear ? ` - ${item.endYear}` : " - Present"}
            </p>
            {normalizeText(item.description ?? "") ? (
              <p className="mt-2 text-sm text-on-surface-variant">{item.description}</p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

export default function TutorProfileSettings() {
  const [profileData, setProfileData] = useState<TutorEditableProfileResponse | null>(null);
  const [formState, setFormState] = useState<ProfileFormState | null>(null);
  const [initialFormState, setInitialFormState] = useState<ProfileFormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [pendingUploadedImage, setPendingUploadedImage] =
    useState<UploadedImageResult | null>(null);
  const latestPendingUploadRef = useRef<UploadedImageResult | null>(null);

  useEffect(() => {
    latestPendingUploadRef.current = pendingUploadedImage;
  }, [pendingUploadedImage]);

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

  useEffect(() => {
    return () => {
      const uploadedImage = latestPendingUploadRef.current;
      if (!uploadedImage) {
        return;
      }

      void deleteUploadedAsset({
        publicId: uploadedImage.publicId,
        resourceType: uploadedImage.resourceType,
        deleteToken: uploadedImage.deleteToken,
      }).catch((cleanupError) => {
        console.warn("Unable to clean up pending uploaded image.", cleanupError);
      });
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
    [formState, profileData]
  );

  const availableDegrees = useMemo(
    () => profileData?.availableDegrees ?? [],
    [profileData]
  );

  const completion = useMemo(() => {
    if (!formState) {
      return { completed: 0, total: 6, percentage: 0 };
    }

    const checks = [
      normalizeText(formState.professionalTitle).length > 0,
      normalizeText(formState.bio).length >= 20,
      Number.isFinite(Number(formState.hourlyRate)) && Number(formState.hourlyRate) > 0,
      Number.isFinite(Number(formState.experienceYears)) &&
        Number(formState.experienceYears) >= 0,
      formState.categoryIds.length > 0,
      formState.subjectIds.length > 0,
    ];

    const completed = checks.filter(Boolean).length;
    const total = checks.length;
    return {
      completed,
      total,
      percentage: getCompletionRatio(completed, total),
    };
  }, [formState]);

  const hasChanges = useMemo(() => {
    if (!formState || !initialFormState) {
      return false;
    }

    return serializeFormState(formState) !== serializeFormState(initialFormState);
  }, [formState, initialFormState]);

  const isProfileComplete = useMemo(
    () => (formState ? !getTutorProfileValidationMessage(formState) : false),
    [formState]
  );

  const selectedCategoryNames = useMemo(
    () =>
      profileData
        ? profileData.availableCategories
            .filter((category) => formState?.categoryIds.includes(category.id))
            .map((category) => category.name)
        : [],
    [formState, profileData]
  );

  const selectedSubjectNames = useMemo(
    () =>
      profileData
        ? profileData.availableSubjects
            .filter((subject) => formState?.subjectIds.includes(subject.id))
            .map((subject) => subject.name)
        : [],
    [formState, profileData]
  );

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

  function openEditor() {
    if (!initialFormState) {
      return;
    }

    setFormState(initialFormState);
    setEditError(null);
    setIsEditing(true);
  }

  async function closeEditor() {
    if (!initialFormState || !formState) {
      setIsEditing(false);
      return;
    }

    if (hasChanges) {
      const confirmation = await Swal.fire({
        icon: "warning",
        title: "Discard unsaved changes?",
        text: "Your profile edits will be lost if you close this dialog now.",
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
    setFormState(initialFormState);
    setEditError(null);
    setIsEditing(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formState || !profileData) {
      return;
    }

    const validationMessage = getTutorProfileValidationMessage(formState);
    if (validationMessage) {
      setEditError(validationMessage);
      return;
    }

    if (!hasChanges) {
      setIsEditing(false);
      setEditError(null);
      return;
    }

    setIsSaving(true);
    setEditError(null);
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
            categoryId: item.categoryId,
            institution: normalizeText(item.institution),
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
      setEditError(null);
      setIsEditing(false);

      await Swal.fire({
        icon: "success",
        title: "Profile updated",
        text: "Your tutor profile has been saved successfully.",
        confirmButtonColor: "#1d3b66",
      });
    } catch (error) {
      if (pendingUploadedImage) {
        await rollbackPendingUploadedImage();

        if (initialFormState) {
          setFormState((current) =>
            current
              ? {
                  ...current,
                  profileImageUrl: initialFormState.profileImageUrl,
                }
              : current
          );
        }
      }

      const nextMessage = toFriendlyTutorProfileError(error);
      setEditError(nextMessage);
      setErrorMessage(nextMessage);

      await Swal.fire({
        icon: "error",
        title: "Profile update failed",
        text: nextMessage,
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
      <StateCard
        title="Tutor profile unavailable"
        description={errorMessage || "Tutor profile could not be loaded."}
        tone="error"
      />
    );
  }

  const profile = profileData.profile;
  const editButtonLabel = isProfileComplete ? "Edit Profile" : "Complete Profile";

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-[1.6rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0px_18px_40px_rgba(0,51,88,0.08)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                Tutor Setup
              </p>
              <h1 className="mt-2 font-headline text-[2rem] font-extrabold tracking-tight text-primary">
                Complete your public tutor profile
              </h1>
            </div>

            <div className="rounded-2xl bg-surface-container-low px-5 py-4 text-sm text-on-surface-variant">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">
                Required Progress
              </p>
              <p className="mt-2 font-headline text-3xl font-black text-primary">
                {completion.percentage}%
              </p>
              <p className="mt-2">
                {completion.completed}/{completion.total} required sections complete
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.6rem] border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-[0px_18px_40px_rgba(0,51,88,0.08)] sm:p-6">
          <div className="flex flex-col gap-5 border-b border-outline-variant/15 pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="mx-auto flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.25rem] bg-surface-container-highest shadow-sm sm:mx-0 sm:h-24 sm:w-24 sm:rounded-[1.5rem]">
                {profile.profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt="Tutor profile preview"
                    className="h-full w-full object-cover"
                    src={profile.profileImageUrl}
                  />
                ) : (
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant">
                    account_circle
                  </span>
                )}
              </div>

              <div className="min-w-0 space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h2 className="font-headline text-[1.95rem] font-bold leading-none text-primary sm:text-[1.75rem]">
                    {profile.displayName}
                  </h2>
                  {!isProfileComplete ? (
                    <span className="rounded-full bg-secondary-container px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-on-secondary-container">
                      Incomplete
                    </span>
                  ) : null}
                </div>
                <p className="text-lg font-semibold text-on-surface sm:text-base">
                  {profile.professionalTitle || "Add your professional title"}
                </p>
                <p className="max-w-3xl text-sm leading-relaxed text-on-surface-variant">
                  {profile.bio || "Your public bio will appear here after you complete your profile."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openEditor}
              className="inline-flex w-full items-center justify-center gap-2 self-stretch rounded-xl bg-primary px-5 py-3 text-[13px] font-bold text-on-primary transition hover:opacity-90 sm:w-auto sm:self-start"
            >
              <PencilLine className="h-4 w-4" />
              {editButtonLabel}
            </button>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className={sectionCardClass}>
              <div className="flex items-center gap-2 text-secondary">
                <Wallet className="h-4 w-4" />
                <p className="text-[11px] font-bold uppercase tracking-[0.18em]">
                  Teaching Details
                </p>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <InfoBlock
                  label="Hourly Rate"
                  value={
                    <p className="text-sm font-semibold text-primary">
                      {profile.hourlyRate > 0 ? `$${profile.hourlyRate}/hr` : "Not added yet"}
                    </p>
                  }
                />
                <InfoBlock
                  label="Experience"
                  value={
                    <p className="text-sm font-semibold text-primary">
                      {profile.experienceYears > 0
                        ? `${profile.experienceYears} year${profile.experienceYears === 1 ? "" : "s"}`
                        : "Not added yet"}
                    </p>
                  }
                />
                <InfoBlock
                  label="Categories"
                  value={
                    <DetailList
                      items={selectedCategoryNames}
                      emptyLabel="No categories selected yet."
                    />
                  }
                />
                <InfoBlock
                  label="Subjects"
                  value={
                    <DetailList
                      items={selectedSubjectNames}
                      emptyLabel="No subjects selected yet."
                      tone="neutral"
                    />
                  }
                />
              </div>
            </div>

            <div className={sectionCardClass}>
              <div className="flex items-center gap-2 text-secondary">
                <GraduationCap className="h-4 w-4" />
                <p className="text-[11px] font-bold uppercase tracking-[0.18em]">
                  Education
                </p>
              </div>
              <div className="mt-5">
                <EducationSummary
                  education={profile.education}
                  availableDegrees={profileData.availableDegrees}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {isEditing ? (
        <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[3px]">
          <div className="flex min-h-full items-center justify-center p-4 md:p-6">
            <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest shadow-[0px_28px_90px_rgba(15,23,42,0.28)]">
              <div className="flex items-start justify-between gap-4 border-b border-outline-variant/15 px-6 py-5">
                <div>
                  <div className="flex items-center gap-2 text-secondary">
                    <Sparkles className="h-4 w-4" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em]">
                      Edit Tutor Profile
                    </p>
                  </div>
                  <h3 className="mt-2 font-headline text-[1.55rem] font-bold text-primary">
                    Update your public tutor details
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => void closeEditor()}
                  className="rounded-xl border border-outline-variant/20 bg-surface p-2 text-on-surface-variant transition hover:text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                className="flex min-h-0 flex-1 flex-col"
                noValidate
                onSubmit={handleSubmit}
              >
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                  <div className="space-y-5">
                    <section className={sectionCardClass}>
                      <div className="mb-5 flex items-center gap-2 text-secondary">
                        <PencilLine className="h-4 w-4" />
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em]">
                          Basic Info
                        </p>
                      </div>
                      <div className="space-y-6">
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
                    </section>

                    <section className={sectionCardClass}>
                      <div className="mb-5 flex items-center gap-2 text-secondary">
                        <Wallet className="h-4 w-4" />
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em]">
                          Teaching Details
                        </p>
                      </div>
                      <div className="space-y-6">
                        <TeachingDetailsForm
                          availableSubjects={availableSubjects}
                          formState={formState}
                          isSaving={isSaving}
                          profileData={profileData}
                          updateFormState={updateFormState}
                        />
                      </div>
                    </section>

                    <section className={sectionCardClass}>
                      <div className="mb-5 flex items-center gap-2 text-secondary">
                        <GraduationCap className="h-4 w-4" />
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em]">
                          Education
                        </p>
                      </div>
                      <EducationForm
                        availableDegrees={availableDegrees}
                        formState={formState}
                        isSaving={isSaving}
                        onAddEducation={() =>
                          updateFormState((current) => ({
                            ...current,
                            education: [...current.education, createBlankEducation()],
                          }))
                        }
                        onRemoveEducation={async (index) => {
                          updateFormState((current) => ({
                            ...current,
                            education: current.education.filter(
                              (_, educationIndex) => educationIndex !== index
                            ),
                          }));
                        }}
                        profileData={profileData}
                        updateFormState={updateFormState}
                      />
                    </section>

                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-outline-variant/15 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
                  {editError ? (
                    <div className="rounded-xl bg-error-container px-4 py-3 text-[13px] text-on-error-container sm:mr-auto">
                      {editError}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void closeEditor()}
                      disabled={isSaving || isUploadingImage}
                      className="rounded-xl border border-outline-variant/20 bg-surface px-4 py-2.5 text-[13px] font-semibold text-primary transition hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving || isUploadingImage}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-bold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
