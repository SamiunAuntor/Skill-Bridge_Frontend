import type { UserRole } from "@/types/auth";

export type AppAuthUser = {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
};

export type AppAuthSession = {
  user: AppAuthUser;
} | null;
