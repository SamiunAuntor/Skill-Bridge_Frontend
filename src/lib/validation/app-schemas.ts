import { z } from "zod";

const optionalTrimmedString = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => {
      if (!value) {
        return undefined;
      }

      return value;
    });

const positiveNumberFromString = z.preprocess((value) => {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}, z.number().positive().optional());

export const subjectsSearchParamsSchema = z.object({
  q: optionalTrimmedString(80),
  sortBy: z.enum(["most_tutors", "alphabetical"]).optional(),
});

export const tutorSearchParamsSchema = z.object({
  q: optionalTrimmedString(80),
  category: optionalTrimmedString(80).transform((value) => value?.toLowerCase()),
  subject: optionalTrimmedString(80).transform((value) => value?.toLowerCase()),
  minPrice: positiveNumberFromString,
  maxPrice: positiveNumberFromString,
  minRating: positiveNumberFromString,
  sortBy: z
    .enum([
      "recommended",
      "highest_rated",
      "lowest_rated",
      "lowest_price",
      "highest_price",
      "most_reviewed",
    ])
    .optional(),
  page: positiveNumberFromString,
  limit: positiveNumberFromString,
});

export const platformReviewInputSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: optionalTrimmedString(90),
  message: z
    .string()
    .trim()
    .min(20, "Please share at least 20 characters.")
    .max(600, "Please keep your review within 600 characters."),
});

export const studentProfileUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Please enter your name before saving.")
    .max(80, "Please keep your display name within 80 characters."),
  profileImageUrl: z
    .union([z.string().trim().url(), z.literal(""), z.null()])
    .transform((value) => {
      if (!value) {
        return null;
      }

      return value;
    }),
});

export const availabilitySlotInputSchema = z
  .object({
    date: z.string().min(1, "Choose a date."),
    startTime: z.string().min(1, "Choose a start time."),
    endTime: z.string().min(1, "Choose an end time."),
  })
  .superRefine((value, context) => {
    const startAt = new Date(`${value.date}T${value.startTime}`);
    const endAt = new Date(`${value.date}T${value.endTime}`);

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      context.addIssue({
        code: "custom",
        message: "Please choose a valid date and time range.",
        path: ["endTime"],
      });
      return;
    }

    if (startAt >= endAt) {
      context.addIssue({
        code: "custom",
        message: "End time must be later than the start time.",
        path: ["endTime"],
      });
      return;
    }

    const durationMinutes = (endAt.getTime() - startAt.getTime()) / (1000 * 60);

    if (durationMinutes < 5) {
      context.addIssue({
        code: "custom",
        message: "Availability must be at least 5 minutes long.",
        path: ["endTime"],
      });
    }

    if (durationMinutes > 180) {
      context.addIssue({
        code: "custom",
        message: "Availability cannot be longer than 3 hours.",
        path: ["endTime"],
      });
    }
  });

export const storedPaymentCheckoutSessionSchema = z.object({
  bookingId: z.string().min(1),
  paymentIntentId: z.string().min(1),
  clientSecret: z.string().min(1),
  amountInCents: z.number().int().nonnegative(),
  currency: z.string().min(1),
  holdExpiresAt: z.string().min(1),
  returnTo: z.string().min(1),
});

export type TutorSearchParamsInput = z.infer<typeof tutorSearchParamsSchema>;
