"use client";

import Image from "next/image";
import { BookOpen, LoaderCircle, Upload } from "lucide-react";

export function SubjectIconUploadField({
  iconUrl,
  isUploading,
  onUpload,
  onRemove,
}: {
  iconUrl: string | null | undefined;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-primary">Subject icon</h3>
          <p className="mt-1 text-xs text-on-surface-variant">
            Upload an image icon through the backend upload flow.
          </p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-high">
          {iconUrl ? (
            <Image
              src={iconUrl}
              alt="Subject icon preview"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
          ) : (
            <BookOpen className="h-5 w-5 text-on-surface-variant" />
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary">
          {isUploading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span>{isUploading ? "Uploading..." : "Upload icon"}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";

              if (!file) {
                return;
              }

              onUpload(file);
            }}
          />
        </label>
        {iconUrl ? (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-xl border border-outline-variant/20 bg-surface-container-high px-4 py-2.5 text-sm font-semibold text-primary"
          >
            Remove icon
          </button>
        ) : null}
      </div>
    </div>
  );
}
