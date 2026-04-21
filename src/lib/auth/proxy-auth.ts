import type { UserRole } from "@/types/auth";

type VerifiedAccessTokenPayload = {
  sub: string;
  role: UserRole;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
  sessionToken: string;
  typ: "access";
  exp?: number;
  iat?: number;
};

type VerifiedRefreshTokenPayload = {
  sub: string;
  sessionToken: string;
  typ: "refresh";
  exp?: number;
  iat?: number;
};

function base64UrlToUint8Array(input: string): Uint8Array {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
}

function parseJwtPayload(token: string): unknown {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid JWT format.");
  }

  const payloadBytes = base64UrlToUint8Array(parts[1]);
  const payloadText = new TextDecoder().decode(payloadBytes);

  return JSON.parse(payloadText) as unknown;
}

function isAccessPayload(payload: unknown): payload is VerifiedAccessTokenPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.sub === "string" &&
    typeof candidate.role === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.emailVerified === "boolean" &&
    typeof candidate.sessionToken === "string" &&
    candidate.typ === "access"
  );
}

function isRefreshPayload(payload: unknown): payload is VerifiedRefreshTokenPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.sub === "string" &&
    typeof candidate.sessionToken === "string" &&
    candidate.typ === "refresh"
  );
}

async function verifyProxyTokenSignature(
  token: string,
  secret: string
): Promise<unknown | null> {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["verify"]
    );

    const verified = await crypto.subtle.verify(
      "HMAC",
      key,
      toArrayBuffer(base64UrlToUint8Array(parts[2])),
      encoder.encode(`${parts[0]}.${parts[1]}`)
    );

    if (!verified) {
      return null;
    }

    return parseJwtPayload(token);
  } catch {
    return null;
  }
}

export async function verifyProxyAccessToken(
  token: string,
  secret: string
): Promise<VerifiedAccessTokenPayload | null> {
  const payload = await verifyProxyTokenSignature(token, secret);

  if (!isAccessPayload(payload)) {
    return null;
  }

  if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
    return null;
  }

  return payload;
}

export async function verifyProxyRefreshToken(
  token: string,
  secret: string
): Promise<VerifiedRefreshTokenPayload | null> {
  const payload = await verifyProxyTokenSignature(token, secret);

  if (!isRefreshPayload(payload)) {
    return null;
  }

  if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
    return null;
  }

  return payload;
}

export function readProxyAccessTokenHint(
  token: string
): VerifiedAccessTokenPayload | null {
  try {
    const payload = parseJwtPayload(token);

    if (!isAccessPayload(payload)) {
      return null;
    }

    if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function readProxyRefreshTokenHint(
  token: string
): VerifiedRefreshTokenPayload | null {
  try {
    const payload = parseJwtPayload(token);

    if (!isRefreshPayload(payload)) {
      return null;
    }

    if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
