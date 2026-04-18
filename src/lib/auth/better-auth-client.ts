import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

function normalizeBetterAuthBaseUrl(value: string): string {
  const normalized = value.replace(/\/$/, "");
  return normalized.endsWith("/api/auth/core")
    ? normalized
    : `${normalized}/api/auth/core`;
}

const baseURL = normalizeBetterAuthBaseUrl(
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:5000"
);

export const betterAuthClient = createAuthClient({
  baseURL,
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: false,
          defaultValue: "student",
          input: true,
        },
      },
    }),
  ],
});

export type BetterAuthSession = typeof betterAuthClient.$Infer.Session;
export type BetterAuthSessionUser = BetterAuthSession["user"];
