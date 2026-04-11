import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

const baseURL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.replace(/\/$/, "") ??
  "http://localhost:5000";

/**
 * Typed Better Auth client. `role` is an additional user field (see backend `auth.ts`);
 * values are enforced as `student` | `tutor` | `admin` on the server.
 *
 * Note: `inferAdditionalFields` only exposes `role` on the client when `type` is
 * declared as `"string"` here; literal unions in this plugin collapse inference in
 * current Better Auth typings. Use `UserRole` / `RegisterRole` in forms for stricter checks.
 */
export const authClient = createAuthClient({
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

export type AuthSession = typeof authClient.$Infer.Session;
export type AuthSessionUser = AuthSession["user"];
