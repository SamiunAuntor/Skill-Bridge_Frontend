const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

interface BackendEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface SignedUploadResponse {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export interface UploadedImageResult {
  secureUrl: string;
  publicId: string;
}

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageUploadError";
  }
}

async function getSignedUpload(): Promise<SignedUploadResponse> {
  const response = await fetch(`${apiBaseUrl}/api/uploads/sign`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | BackendEnvelope<SignedUploadResponse>
    | { message?: string }
    | null;

  if (!response.ok || !payload || !("data" in payload)) {
    throw new ImageUploadError(
      payload?.message || "Unable to prepare image upload."
    );
  }

  return payload.data;
}

export async function uploadImage(file: File): Promise<UploadedImageResult> {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedMimeTypes.includes(file.type)) {
    throw new ImageUploadError("Upload a JPG, PNG, or WEBP image.");
  }

  if (file.size > 3 * 1024 * 1024) {
    throw new ImageUploadError("Image size must be 3MB or smaller.");
  }

  const signedUpload = await getSignedUpload();
  const formData = new FormData();

  formData.append("file", file);
  formData.append("api_key", signedUpload.apiKey);
  formData.append("timestamp", String(signedUpload.timestamp));
  formData.append("signature", signedUpload.signature);
  formData.append("folder", signedUpload.folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signedUpload.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const payload = (await response.json().catch(() => null)) as
    | { secure_url?: string; public_id?: string; error?: { message?: string } }
    | null;

  if (!response.ok || !payload?.secure_url || !payload.public_id) {
    throw new ImageUploadError(
      payload?.error?.message || "Unable to upload image."
    );
  }

  return {
    secureUrl: payload.secure_url,
    publicId: payload.public_id,
  };
}
