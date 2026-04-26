import { normalizeText } from "@/lib/text";
import { TutorProfileApiError } from "@/lib/tutor-profile-api";
import type {
  TutorEditableProfileResponse,
  TutorEditableSubjectOption,
  TutorProfileUpdateEducationInput,
} from "@/types/tutor";
import type { AvailableDegreeOption, ProfileFormState } from "./shared";

export function toFriendlyTutorProfileError(error: unknown): string {
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

  if (/education\[\d+\]\.categoryId/i.test(message)) {
    return "Each education entry must include an education category.";
  }

  if (/selected education categories are invalid/i.test(message)) {
    return "One or more selected education categories are invalid. Please choose them again.";
  }

  if (/education degree must belong to its selected education category/i.test(message)) {
    return "Each degree must be chosen from the same education category.";
  }

  if (/education\[\d+\]\.startYear cannot be greater than endYear/i.test(message)) {
    return "One education entry has a start year later than its end year.";
  }

  return message;
}

export function createBlankEducation(
  defaultDegree?: AvailableDegreeOption
): TutorProfileUpdateEducationInput {
  return {
    degreeId: defaultDegree?.id ?? "",
    categoryId: defaultDegree?.categoryId ?? "",
    institution: "",
    startYear: new Date().getFullYear(),
    endYear: null,
    description: "",
  };
}

export function mapProfileToFormState(
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
            categoryId: item.categoryId,
            institution: item.institution,
            startYear: item.startYear,
            endYear: item.endYear,
            description: item.description ?? "",
          }))
        : [createBlankEducation(defaultDegree)],
  };
}

export function serializeFormState(state: ProfileFormState): string {
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
      categoryId: item.categoryId,
      institution: normalizeText(item.institution),
      startYear: Number(item.startYear),
      endYear: item.endYear ?? null,
      description: normalizeText(item.description),
    })),
  });
}

export function getCompletionRatio(completed: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

export function getAvailableSubjectsForSelection(
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

export function getTutorProfileValidationMessage(
  state: ProfileFormState
): string | null {
  if (!normalizeText(state.professionalTitle)) {
    return "Add a professional title so students immediately understand your teaching identity.";
  }

  if (normalizeText(state.bio).length < 20) {
    return "Write a bio of at least 20 characters so students get a meaningful introduction.";
  }

  if (!Number.isFinite(Number(state.hourlyRate)) || Number(state.hourlyRate) <= 0) {
    return "Set an hourly rate greater than 0.";
  }

  if (!Number.isFinite(Number(state.experienceYears)) || Number(state.experienceYears) < 0) {
    return "Experience years cannot be negative.";
  }

  if (state.categoryIds.length === 0) {
    return "Choose at least one teaching category.";
  }

  if (state.subjectIds.length === 0) {
    return "Select at least one subject under your chosen categories.";
  }

  const invalidEducation = state.education.find((item) => {
    const hasAnyValue =
      normalizeText(item.categoryId) ||
      normalizeText(item.degreeId) ||
      normalizeText(item.institution) ||
      normalizeText(item.description);

    if (!hasAnyValue) {
      return false;
    }

    return (
      !normalizeText(item.categoryId) ||
      !normalizeText(item.degreeId) ||
      !normalizeText(item.institution) ||
      !Number.isFinite(Number(item.startYear))
    );
  });

  if (invalidEducation) {
    return "Complete category, degree, institution, and start year for each education entry you keep.";
  }

  const invalidYearRange = state.education.find(
    (item) => item.endYear !== null && Number(item.startYear) > Number(item.endYear)
  );

  if (invalidYearRange) {
    return "Education start year cannot be later than end year.";
  }

  return null;
}

export function getTutorProfileValidationMessageForModal(
  state: ProfileFormState,
  modal: "basic" | "teaching" | "education"
): string | null {
  if (modal === "basic") {
    if (!normalizeText(state.professionalTitle)) {
      return "Add a professional title so students immediately understand your teaching identity.";
    }

    if (normalizeText(state.bio).length < 20) {
      return "Write a bio of at least 20 characters so students get a meaningful introduction.";
    }

    return null;
  }

  if (modal === "teaching") {
    if (!Number.isFinite(Number(state.hourlyRate)) || Number(state.hourlyRate) <= 0) {
      return "Set an hourly rate greater than 0.";
    }

    if (!Number.isFinite(Number(state.experienceYears)) || Number(state.experienceYears) < 0) {
      return "Experience years cannot be negative.";
    }

    if (state.categoryIds.length === 0) {
      return "Choose at least one teaching category.";
    }

    if (state.subjectIds.length === 0) {
      return "Select at least one subject under your chosen categories.";
    }

    return null;
  }

  const invalidEducation = state.education.find((item) => {
    const hasAnyValue =
      normalizeText(item.categoryId) ||
      normalizeText(item.degreeId) ||
      normalizeText(item.institution) ||
      normalizeText(item.description);

    if (!hasAnyValue) {
      return false;
    }

    return (
      !normalizeText(item.categoryId) ||
      !normalizeText(item.degreeId) ||
      !normalizeText(item.institution) ||
      !Number.isFinite(Number(item.startYear))
    );
  });

  if (invalidEducation) {
    return "Complete category, degree, institution, and start year for each education entry you keep.";
  }

  const invalidYearRange = state.education.find(
    (item) => item.endYear !== null && Number(item.startYear) > Number(item.endYear)
  );

  if (invalidYearRange) {
    return "Education start year cannot be later than end year.";
  }

  return null;
}
