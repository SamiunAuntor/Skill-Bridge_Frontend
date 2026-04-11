/**
 * Must stay in sync with Prisma `Role`, backend `auth.constants.ts`, and `auth.user.additionalFields.role`.
 */
export const USER_ROLES = ["student", "tutor", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Roles allowed at self-service registration (no admin signup). */
export const REGISTER_ROLES = ["student", "tutor"] as const;
export type RegisterRole = (typeof REGISTER_ROLES)[number];
