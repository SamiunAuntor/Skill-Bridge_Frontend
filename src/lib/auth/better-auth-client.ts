import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const betterAuthClient = createAuthClient({
  basePath: "/api/auth/core",
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
