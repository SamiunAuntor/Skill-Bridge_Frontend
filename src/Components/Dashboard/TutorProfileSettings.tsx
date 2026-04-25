"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useAppAuthSession } from "@/lib/auth";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";
import TutorEducationCard from "@/Components/Dashboard/TutorProfile/TutorEducationCard";
import TutorIdentityCard from "@/Components/Dashboard/TutorProfile/TutorIdentityCard";
import TutorProfileEditModal from "@/Components/Dashboard/TutorProfile/TutorProfileEditModal";
import TutorTeachingProfileCard from "@/Components/Dashboard/TutorProfile/TutorTeachingProfileCard";
import { ProfileFormState, TutorModalType } from "@/Components/Dashboard/TutorProfile/shared";
import {
  createBlankEducation,
  getAvailableSubjectsForSelection,
  getCompletionRatio,
  getTutorProfileValidationMessage,
  mapProfileToFormState,
  serializeFormState,
  toFriendlyTutorProfileError,
} from "@/Components/Dashboard/TutorProfile/profileUtils";
import {
  getMyTutorProfile,
  TutorProfileApiError,
  updateMyTutorProfile,
} from "@/lib/tutor-profile-api";
import { deleteUploadedAsset, UploadedImageResult } from "@/lib/upload-image";
import { normalizeText } from "@/lib/text";
import type {
  TutorEditableProfileResponse,
  TutorProfileUpdateInput,
} from "@/types/tutor";

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
  const [activeModal, setActiveModal] = useState<TutorModalType | null>(null);
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

  const availableDegrees = useMemo(
    () => profileData?.availableDegrees ?? [],
    [profileData]
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

  const isEditing = activeModal !== null;

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

  function handleOpenModal(modal: TutorModalType) {
    setErrorMessage(null);
    setActiveModal(modal);
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

    setActiveModal(null);
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
      const defaultDegree = availableDegrees[0] ?? profileData?.availableDegrees[0];

      return {
        ...current,
        education:
          current.education.length > 1
            ? current.education.filter((_, educationIndex) => educationIndex !== index)
            : [createBlankEducation(defaultDegree)],
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

    const validationMessage = getTutorProfileValidationMessage(formState);

    if (validationMessage) {
      await Swal.fire({
        icon: "warning",
        title: "Profile is incomplete",
        text: validationMessage,
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
      setActiveModal(null);

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
  const roleLabel = session?.user.role ?? "tutor";
  const isEmailVerified = Boolean(session?.user.emailVerified);
  const selectedCategoryNames = profileData.availableCategories
    .filter((category) => formState.categoryIds.includes(category.id))
    .map((category) => category.name);
  const selectedSubjectNames = profileData.availableSubjects
    .filter((subject) => formState.subjectIds.includes(subject.id))
    .map((subject) => subject.name);
  const educationSummaries = formState.education
    .filter((item) => normalizeText(item.degreeId) || normalizeText(item.institution))
    .map((item, index) => {
      const degree = availableDegrees.find((entry) => entry.id === item.degreeId);

      return {
        id: item.id ?? `education-summary-${index}`,
        degreeName: degree?.name ?? "Education entry",
        institution: item.institution,
        period: `${item.startYear}${item.endYear ? ` - ${item.endYear}` : " - Present"}`,
      };
    });

  function handleAddEducation() {
    updateFormState((current) => ({
      ...current,
      education: [createBlankEducation(), ...current.education],
    }));
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <TutorIdentityCard
        completionCompleted={completionStats.completed}
        completionPercentage={completionPercentage}
        completionTotal={completionStats.total}
        errorMessage={errorMessage}
        formState={formState}
        isEmailVerified={isEmailVerified}
        onEdit={() => handleOpenModal("basic")}
        roleLabel={roleLabel}
        tutorName={profileData.profile.displayName}
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <TutorTeachingProfileCard
          formState={formState}
          onEdit={() => handleOpenModal("teaching")}
          selectedCategoryNames={selectedCategoryNames}
          selectedSubjectNames={selectedSubjectNames}
        />
        <TutorEducationCard
          educationSummaries={educationSummaries}
          onManage={() => handleOpenModal("education")}
        />
      </section>

      <TutorProfileEditModal
        activeModal={activeModal}
        availableDegrees={availableDegrees}
        availableSubjects={availableSubjects}
        errorMessage={errorMessage}
        formState={formState}
        hasChanges={hasChanges}
        isSaving={isSaving}
        isUploadingImage={isUploadingImage}
        onAddEducation={handleAddEducation}
        onCancel={handleCancelEditing}
        onRemoveEducation={handleRemoveEducation}
        pendingUploadedImage={pendingUploadedImage}
        profileData={profileData}
        setIsUploadingImage={setIsUploadingImage}
        setPendingUploadedImage={setPendingUploadedImage}
        updateFormState={updateFormState}
      />
    </form>
  );
}
