"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { BadgeCheck, Camera, GraduationCap, Mail, UserRound } from "lucide-react";
import { notifyAuthChanged, useAppAuthSession } from "@/lib/auth";
import { updateMyStudentProfile } from "@/lib/student-profile-api";
import {
  deleteUploadedAsset,
  UploadedImageResult,
  uploadImage,
} from "@/lib/upload-image";

export default function StudentProfileSettings() {
  const { data: session } = useAppAuthSession();
  const [displayName, setDisplayName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [initialDisplayName, setInitialDisplayName] = useState("");
  const [initialProfileImageUrl, setInitialProfileImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [pendingUploadedImage, setPendingUploadedImage] =
    useState<UploadedImageResult | null>(null);

  useEffect(() => {
    if (!session?.user || hasInitialized) {
      return;
    }

    const nextName = session.user.name?.trim() || "";
    const nextImage = session.user.image?.trim() || null;

    setDisplayName(nextName);
    setProfileImageUrl(nextImage);
    setInitialDisplayName(nextName);
    setInitialProfileImageUrl(nextImage);
    setHasInitialized(true);
  }, [hasInitialized, session?.user]);

  const hasChanges = useMemo(() => {
    return (
      displayName.trim() !== initialDisplayName ||
      (profileImageUrl ?? null) !== (initialProfileImageUrl ?? null)
    );
  }, [displayName, initialDisplayName, initialProfileImageUrl, profileImageUrl]);

  if (session?.user?.role && session.user.role !== "student") {
    return null;
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      const uploaded = await uploadImage(file);

      if (pendingUploadedImage) {
        try {
          await deleteUploadedAsset({
            publicId: pendingUploadedImage.publicId,
            resourceType: pendingUploadedImage.resourceType,
            deleteToken: pendingUploadedImage.deleteToken,
          });
        } catch (rollbackError) {
          console.warn("Unable to remove replaced uploaded image.", rollbackError);
        }
      }

      setProfileImageUrl(uploaded.secureUrl);
      setPendingUploadedImage(uploaded);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Upload failed",
        text:
          error instanceof Error
            ? error.message
            : "Unable to upload this image right now.",
        confirmButtonColor: "#1d3b66",
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = displayName.trim();

    if (!trimmedName) {
      await Swal.fire({
        icon: "warning",
        title: "Name is required",
        text: "Please enter your name before saving.",
        confirmButtonColor: "#1d3b66",
      });
      return;
    }

    if (trimmedName.length > 80) {
      await Swal.fire({
        icon: "warning",
        title: "Name is too long",
        text: "Please keep your display name within 80 characters.",
        confirmButtonColor: "#1d3b66",
      });
      return;
    }

    if (!hasChanges) {
      return;
    }

    setIsSaving(true);

    try {
      await updateMyStudentProfile({
        fullName: trimmedName,
        profileImageUrl: profileImageUrl ?? null,
      });

      setInitialDisplayName(trimmedName);
      setInitialProfileImageUrl(profileImageUrl ?? null);
      setPendingUploadedImage(null);
      notifyAuthChanged();

      await Swal.fire({
        icon: "success",
        title: "Profile updated",
        text: "Your student profile information has been saved.",
        confirmButtonColor: "#1d3b66",
      });
    } catch (error) {
      if (pendingUploadedImage) {
        try {
          await deleteUploadedAsset({
            publicId: pendingUploadedImage.publicId,
            resourceType: pendingUploadedImage.resourceType,
            deleteToken: pendingUploadedImage.deleteToken,
          });
        } catch (rollbackError) {
          console.warn("Unable to roll back unsaved uploaded image.", rollbackError);
        }

        setProfileImageUrl(initialProfileImageUrl);
        setPendingUploadedImage(null);
      }

      await Swal.fire({
        icon: "error",
        title: "Profile update failed",
        text:
          error instanceof Error
            ? error.message
            : "Unable to update your profile right now.",
        confirmButtonColor: "#1d3b66",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-[1.5rem] border border-outline-variant/14 bg-surface-container-lowest p-5 shadow-[0px_18px_40px_rgba(0,51,88,0.08)]">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
          Student Profile
        </p>
        <h2 className="mt-2.5 font-headline text-[2rem] font-bold text-primary">
          Edit Your Info
        </h2>
        <p className="mt-2.5 max-w-2xl text-[14px] text-on-surface-variant">
          Update the basic information tied to your student account.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-outline-variant/20 bg-surface px-4 py-3">
            <div className="flex items-center gap-2 text-secondary">
              <GraduationCap className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                Role
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold capitalize text-primary">
              {session?.user.role ?? "student"}
            </p>
          </div>
          <div className="rounded-2xl border border-outline-variant/20 bg-surface px-4 py-3">
            <div className="flex items-center gap-2 text-secondary">
              <BadgeCheck className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                Verification
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-primary">
              {session?.user.emailVerified ? "Email verified" : "Email not verified"}
            </p>
          </div>
          <div className="rounded-2xl border border-outline-variant/20 bg-surface px-4 py-3">
            <div className="flex items-center gap-2 text-secondary">
              <UserRound className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                Profile
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-primary">
              {profileImageUrl ? "Photo added" : "Photo optional"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            {profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profileImageUrl}
                alt=""
                className="h-16 w-16 rounded-2xl object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
                <UserRound className="h-7 w-7" />
              </div>
            )}

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary/90">
              <Camera className="h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload Photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => void handleImageChange(event)}
                disabled={isUploading || isSaving}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[13px] font-semibold text-primary">Full Name</span>
            <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface px-4 py-2.5">
              <UserRound className="h-5 w-5 text-secondary" />
              <input
                type="text"
                value={displayName}
                maxLength={80}
                onChange={(event) => setDisplayName(event.target.value)}
                className="w-full border-none bg-transparent text-[13px] text-on-surface outline-none focus:ring-0"
                placeholder="Your full name"
              />
            </div>
            <p className="text-[11px] text-on-surface-variant">
              This name appears on your student dashboard and session records.
            </p>
          </label>

          <label className="space-y-2">
            <span className="text-[13px] font-semibold text-primary">Email</span>
            <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface px-4 py-2.5 text-[13px] text-on-surface-variant">
              <Mail className="h-5 w-5 text-secondary" />
              <span>{session?.user.email ?? "No email available"}</span>
            </div>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving || isUploading || !hasChanges}
            className="rounded-2xl bg-primary px-6 py-2.5 text-[13px] font-bold text-on-primary transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
