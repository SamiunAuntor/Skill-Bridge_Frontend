import { NextResponse } from "next/server";

export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/payment/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-pending",
  ],
};