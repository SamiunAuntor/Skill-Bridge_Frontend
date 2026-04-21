import { NextRequest, NextResponse } from "next/server";
import { authRoutePaths, canAccessDashboardPath, getDefaultAppPath } from "@/lib/auth/route-policy";
import { getLegacyDashboardRedirectPath } from "@/lib/dashboard-routes";
import {
  readProxyAccessTokenHint,
  readProxyRefreshTokenHint,
  verifyProxyAccessToken,
  verifyProxyRefreshToken,
} from "@/lib/auth/proxy-auth";
import { USER_ROLES, type UserRole } from "@/types/auth";

const accessTokenCookieName =
  process.env.ACCESS_TOKEN_COOKIE_NAME || "skillbridge_access_token";
const refreshTokenCookieName =
  process.env.REFRESH_TOKEN_COOKIE_NAME || "skillbridge_refresh_token";
const jwtSecret = process.env.JWT_SECRET;

function isAuthRoute(pathname: string): boolean {
  return authRoutePaths.some((route) => pathname === route);
}

function buildLoginRedirect(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (request.nextUrl.pathname !== "/login") {
    loginUrl.searchParams.set("next", nextPath);
  }

  return NextResponse.redirect(loginUrl);
}

function isLegacyDashboardPath(pathname: string): boolean {
  return [
    "/dashboard",
    "/dashboard/profile",
    "/dashboard/sessions",
    "/dashboard/bookings",
    "/dashboard/availability",
    "/dashboard/finances",
    "/dashboard/resources",
  ].includes(pathname);
}

function isKnownRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(accessTokenCookieName)?.value;
  const refreshToken = request.cookies.get(refreshTokenCookieName)?.value;

  let role: UserRole | null = null;
  let hasVerifiedRefreshToken = false;

  if (accessToken) {
    const payload = jwtSecret
      ? (await verifyProxyAccessToken(accessToken, jwtSecret)) ??
        readProxyAccessTokenHint(accessToken)
      : readProxyAccessTokenHint(accessToken);

    if (payload && isKnownRole(payload.role)) {
      role = payload.role;
    }
  }

  if (refreshToken) {
    hasVerifiedRefreshToken = Boolean(
      jwtSecret
        ? (await verifyProxyRefreshToken(refreshToken, jwtSecret)) ??
            readProxyRefreshTokenHint(refreshToken)
        : readProxyRefreshTokenHint(refreshToken)
    );
  }

  if (isAuthRoute(pathname)) {
    if (role) {
      return NextResponse.redirect(new URL(getDefaultAppPath(role), request.url));
    }

    if (hasVerifiedRefreshToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!role && !hasVerifiedRefreshToken) {
      return buildLoginRedirect(request);
    }

    if (role && isLegacyDashboardPath(pathname)) {
      const targetPath = getLegacyDashboardRedirectPath(role, pathname);

      if (targetPath !== pathname) {
        return NextResponse.redirect(new URL(targetPath, request.url));
      }
    }

    if (role && !canAccessDashboardPath(role, pathname)) {
      return NextResponse.redirect(new URL(getDefaultAppPath(role), request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-pending",
  ],
};
