const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

interface BackendEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export type UploadedAssetResourceType = "image" | "raw";

export interface UploadedImageResult {
  secureUrl: string;
  publicId: string;
  originalName: string;
  resourceType: UploadedAssetResourceType;
  bytes: number;
}

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageUploadError";
  }
}

function getUploadErrorMessage(
  response: Response,
  payload: { message?: string } | null,
  fallbackMessage: string
): string {
  if (payload?.message) {
    return payload.message;
  }

  if (response.status >= 500) {
    return fallbackMessage;
  }

  return "Unable to upload this file right now.";
}

export async function uploadImage(file: File): Promise<UploadedImageResult> {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedMimeTypes.includes(file.type)) {
    throw new ImageUploadError("Upload a JPG, PNG, or WEBP image.");
  }

  if (file.size > 3 * 1024 * 1024) {
    throw new ImageUploadError("Image size must be 3MB or smaller.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${apiBaseUrl}/api/uploads/images`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | BackendEnvelope<UploadedImageResult>
    | { message?: string }
    | null;

  if (!response.ok || !payload || !("data" in payload)) {
    throw new ImageUploadError(
      getUploadErrorMessage(
        response,
        payload,
        "We couldn't upload this image right now. Please try again."
      )
    );
  }

  return payload.data;
}

export async function deleteUploadedAsset(input: {
  publicId: string;
  resourceType: UploadedAssetResourceType;
}): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/uploads/assets`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string }
    | null;

  if (!response.ok) {
    throw new ImageUploadError(
      getUploadErrorMessage(
        response,
        payload,
        "We couldn't remove the uploaded file right now."
      )
    );
  }
}
