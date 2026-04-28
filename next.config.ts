import type { NextConfig } from "next";

function normalizeOrigin(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/$/, "");
}

const backendOrigin =
  normalizeOrigin(process.env.NEXT_PUBLIC_API_BASE_URL) ||
  normalizeOrigin(process.env.NEXT_PUBLIC_BETTER_AUTH_URL) ||
  (process.env.NODE_ENV === "production" ? null : "http://localhost:5000");

if (process.env.NODE_ENV === "production" && !backendOrigin) {
  throw new Error(
    "Missing NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_BETTER_AUTH_URL for Next.js rewrites."
  );
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    if (!backendOrigin) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
