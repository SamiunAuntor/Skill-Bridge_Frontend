"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Camera, LoaderCircle } from "lucide-react";
import {
  getMyTutorProfile,
  TutorProfileApiError,
  updateMyTutorProfile,
} from "@/lib/tutor-profile-api";
import { ImageUploadError, uploadImage } from "@/lib/upload-image";
import {
  TutorEditableProfileResponse,
  TutorProfileUpdateEducationInput,
  TutorProfileUpdateExpertiseInput,
  TutorProfileUpdateInput,
} from "@/types/tutor";

type ProfileFormState = TutorProfileUpdateInput;

const sectionCardClass =
  "rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-7 shadow-[0px_16px_40px_rgba(0,51,88,0.08)] dark:border-outline-variant/10 dark:bg-surface-container-low dark:shadow-[0px_12px_32px_rgba(0,0,0,0.24)]";

const inputClass =
  "w-full rounded-xl border border-outline-variant/30 bg-white px-4 py-3 text-on-surface shadow-sm shadow-slate-900/5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-outline-variant/30 dark:bg-surface-container dark:shadow-none";

const textAreaClass = `${inputClass} min-h-32 resize-y`;

function createBlankExpertise(): TutorProfileUpdateExpertiseInput {
  return { name: "" };
}

function createBlankEducation(): TutorProfileUpdateEducationInput {
  return {
    degree: "",
    institution: "",
    fieldOfStudy: "",
    startYear: new Date().getFullYear(),
    endYear: null,
    description: "",
  };
}

function mapProfileToFormState(
  data: TutorEditableProfileResponse["profile"]
): ProfileFormState {
  return {
    profileImageUrl: data.profileImageUrl,
    bio: data.bio,
    hourlyRate: data.hourlyRate,
    experienceYears: data.experienceYears,
    categoryIds: data.categoryIds,
    expertise:
      data.expertise.length > 0
        ? data.expertise.map((item) => ({ id: item.id, name: item.name }))
        : [createBlankExpertise()],
    education:
      data.education.length > 0
        ? data.education.map((item) => ({
            id: item.id,
            degree: item.degree,
            institution: item.institution,
            fieldOfStudy: item.fieldOfStudy,
            startYear: item.startYear,
            endYear: item.endYear,
            description: item.description ?? "",
          }))
        : [createBlankEducation()],
  };
}

function getCompletionRatio(completed: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

export default function TutorProfileSettings() {
  const [profileData, setProfileData] = useState<TutorEditableProfileResponse | null>(
    null
  );
  const [formState, setFormState] = useState<ProfileFormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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

        setProfileData(response);
        setFormState(mapProfileToFormState(response.profile));
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

  const completionStats = useMemo(() => {
    if (!formState) {
      return { completed: 0, total: 5 };
    }

    const checks = [
      Boolean(formState.profileImageUrl?.trim()),
      formState.bio.trim().length > 0,
      formState.hourlyRate > 0,
      formState.experienceYears > 0,
      formState.categoryIds.length > 0 || formState.expertise.some((item) => item.name.trim()),
      formState.education.some(
        (item) => item.degree.trim() && item.institution.trim()
      ),
    ];

    return {
      completed: checks.filter(Boolean).length,
      total: checks.length,
    };
  }, [formState]);

  function updateFormState(updater: (current: ProfileFormState) => ProfileFormState) {
    setFormState((current) => (current ? updater(current) : current));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formState) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const normalizedPayload: TutorProfileUpdateInput = {
        profileImageUrl: formState.profileImageUrl,
        bio: formState.bio.trim(),
        hourlyRate: Number(formState.hourlyRate) || 0,
        experienceYears: Number(formState.experienceYears) || 0,
        categoryIds: formState.categoryIds,
        expertise: formState.expertise
          .map((item) => ({
            ...(item.id ? { id: item.id } : {}),
            name: item.name.trim(),
          }))
          .filter((item) => item.name.length > 0),
        education: formState.education
          .map((item) => ({
            ...(item.id ? { id: item.id } : {}),
            degree: item.degree.trim(),
            institution: item.institution.trim(),
            fieldOfStudy: item.fieldOfStudy?.trim() || "",
            startYear: Number(item.startYear),
            ...(item.endYear ? { endYear: Number(item.endYear) } : {}),
            description: item.description?.trim() || "",
          }))
          .filter((item) => item.degree.length > 0 && item.institution.length > 0),
      };

      const response = await updateMyTutorProfile(normalizedPayload);
      setProfileData(response);
      setFormState(mapProfileToFormState(response.profile));
      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof TutorProfileApiError
          ? error.message
          : "Unable to update tutor profile."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-[1.75rem] border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-[0px_16px_40px_rgba(0,51,88,0.08)] dark:border-outline-variant/10 dark:bg-surface-container-low dark:shadow-[0px_12px_32px_rgba(0,0,0,0.24)]">
        <p className="text-sm text-on-surface-variant">Loading tutor profile...</p>
      </section>
    );
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
      <section className="rounded-[1.75rem] border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-[0px_16px_40px_rgba(0,51,88,0.08)] dark:border-outline-variant/10 dark:bg-surface-container-low dark:shadow-[0px_12px_32px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-headline text-4xl font-extrabold tracking-tight text-primary">
              Build your public tutoring identity
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Set up the information students will see on your public profile.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-primary px-6 py-3 font-headline text-base font-bold text-on-primary transition hover:opacity-90 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>

        <div className="mt-6 rounded-2xl bg-primary-fixed/40 p-4">
          <div className="flex items-center justify-between text-sm font-semibold text-primary">
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
          <div className="mt-5 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-5 rounded-xl bg-secondary-fixed/40 px-4 py-3 text-sm text-on-secondary-fixed">
            {successMessage}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <div className="space-y-6">
          <article className={sectionCardClass}>
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl bg-surface-container-highest shadow-sm">
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

              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-headline text-2xl font-bold text-primary">
                    Profile Photo
                  </h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Upload a clear headshot for your public tutor card and profile.
                  </p>
                </div>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary transition hover:opacity-90">
                  {isUploadingImage ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <span>
                    {isUploadingImage ? "Uploading..." : "Upload New Image"}
                  </span>
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";

                      if (!file) {
                        return;
                      }

                      setErrorMessage(null);
                      setSuccessMessage(null);
                      setIsUploadingImage(true);

                      try {
                        const result = await uploadImage(file);
                        updateFormState((current) => ({
                          ...current,
                          profileImageUrl: result.secureUrl,
                        }));
                        setSuccessMessage(
                          "Profile image uploaded. Save profile to keep it."
                        );
                      } catch (error) {
                        setErrorMessage(
                          error instanceof ImageUploadError
                            ? error.message
                            : "Unable to upload profile image."
                        );
                      } finally {
                        setIsUploadingImage(false);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </article>

          <article className={sectionCardClass}>
            <h3 className="font-headline text-2xl font-bold text-primary">
              Professional Summary
            </h3>

            <div className="mt-5 space-y-2">
              <label className="block text-sm font-semibold text-on-surface" htmlFor="bio">
                Bio
              </label>
              <textarea
                id="bio"
                className={textAreaClass}
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
            <h3 className="font-headline text-2xl font-bold text-primary">
              Teaching Details
            </h3>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface" htmlFor="rate">
                  Hourly Rate ($)
                </label>
                <input
                  id="rate"
                  min={0}
                  step="1"
                  type="number"
                  className={inputClass}
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
                  className="block text-sm font-semibold text-on-surface"
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
              <label className="block text-sm font-semibold text-on-surface">
                Categories
              </label>
              <div className="flex flex-wrap gap-3">
                {profileData.availableCategories.map((category) => {
                  const isSelected = formState.categoryIds.includes(category.id);

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() =>
                        updateFormState((current) => ({
                          ...current,
                          categoryIds: isSelected
                            ? current.categoryIds.filter((id) => id !== category.id)
                            : [...current.categoryIds, category.id],
                        }))
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
          </article>

          <article className={sectionCardClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-headline text-2xl font-bold text-primary">
                Areas of Expertise
              </h3>
              <button
                type="button"
                onClick={() =>
                  updateFormState((current) => ({
                    ...current,
                    expertise: [...current.expertise, createBlankExpertise()],
                  }))
                }
                className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary"
              >
                Add Expertise
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {formState.expertise.map((item, index) => (
                <div
                  key={item.id ?? `expertise-${index}`}
                  className="flex flex-col gap-3 rounded-2xl border border-outline-variant/25 bg-white p-4 shadow-sm shadow-slate-900/5 md:flex-row dark:border-outline-variant/20 dark:bg-surface-container dark:shadow-none"
                >
                  <input
                    className={inputClass}
                    value={item.name}
                    onChange={(event) =>
                      updateFormState((current) => ({
                        ...current,
                        expertise: current.expertise.map((expertiseItem, expertiseIndex) =>
                          expertiseIndex === index
                            ? { ...expertiseItem, name: event.target.value }
                            : expertiseItem
                        ),
                      }))
                    }
                    placeholder="Add expertise..."
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateFormState((current) => ({
                        ...current,
                        expertise:
                          current.expertise.length > 1
                            ? current.expertise.filter((_, expertiseIndex) => expertiseIndex !== index)
                            : [createBlankExpertise()],
                      }))
                    }
                    className="rounded-xl bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container md:min-w-32"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </article>
        </div>

        <article className={sectionCardClass}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-headline text-2xl font-bold text-primary">
              Education
            </h3>
            <button
              type="button"
              onClick={() =>
                updateFormState((current) => ({
                  ...current,
                  education: [...current.education, createBlankEducation()],
                }))
              }
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary"
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
                <p className="text-sm font-bold text-primary">
                  Education History {index + 1}
                </p>

                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-on-surface">
                      Degree
                    </label>
                    <input
                      className={inputClass}
                      value={item.degree}
                      onChange={(event) =>
                        updateFormState((current) => ({
                          ...current,
                          education: current.education.map((educationItem, educationIndex) =>
                            educationIndex === index
                              ? { ...educationItem, degree: event.target.value }
                              : educationItem
                          ),
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-on-surface">
                      Institution
                    </label>
                    <input
                      className={inputClass}
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
                    <label className="block text-sm font-semibold text-on-surface">
                      Field of Study
                    </label>
                    <input
                      className={inputClass}
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
                      <label className="block text-sm font-semibold text-on-surface">
                        Start Year
                      </label>
                      <input
                        min={1900}
                        max={3000}
                        type="number"
                        className={inputClass}
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
                      <label className="block text-sm font-semibold text-on-surface">
                        End Year
                      </label>
                      <input
                        min={1900}
                        max={3000}
                        type="number"
                        className={inputClass}
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
                    <label className="block text-sm font-semibold text-on-surface">
                      Description
                    </label>
                    <textarea
                      className={`${inputClass} min-h-24 resize-y`}
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
                  onClick={() =>
                    updateFormState((current) => ({
                      ...current,
                      education:
                        current.education.length > 1
                          ? current.education.filter((_, educationIndex) => educationIndex !== index)
                          : [createBlankEducation()],
                    }))
                  }
                  className="mt-5 w-full rounded-xl border border-error-container bg-error-container/50 px-4 py-3 text-sm font-semibold text-on-error-container"
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
