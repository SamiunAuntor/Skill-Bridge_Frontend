import { NextRequest, NextResponse } from "next/server";

const accessTokenCookieName =
  process.env.ACCESS_TOKEN_COOKIE_NAME || "skillbridge_access_token";
const refreshTokenCookieName =
  process.env.REFRESH_TOKEN_COOKIE_NAME || "skillbridge_refresh_token";
const authRoutePaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-pending",
] as const;

function buildLoginRedirect(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (request.nextUrl.pathname !== "/login") {
    loginUrl.searchParams.set("next", nextPath);
  }

  return NextResponse.redirect(loginUrl);
}

function hasAnyAuthCookie(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get(accessTokenCookieName)?.value ||
      request.cookies.get(refreshTokenCookieName)?.value
  );
}

function isAuthRoute(pathname: string): boolean {
  return authRoutePaths.some((route) => pathname === route);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthCookie = hasAnyAuthCookie(request);

  if (isAuthRoute(pathname)) {
    if (hasAuthCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!hasAuthCookie) {
      return buildLoginRedirect(request);
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
