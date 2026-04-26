"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  Camera,
  GraduationCap,
  Mail,
  PencilLine,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { notifyAuthChanged, useAppAuthSession } from "@/lib/auth";
import { updateMyStudentProfile } from "@/lib/student-profile-api";
import {
  deleteUploadedAsset,
  UploadedImageResult,
  uploadImage,
} from "@/lib/upload-image";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";

export default function StudentProfileSettings() {
  const { data: session, isPending } = useAppAuthSession();
  const [displayName, setDisplayName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [initialDisplayName, setInitialDisplayName] = useState("");
  const [initialProfileImageUrl, setInitialProfileImageUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
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

  if (isPending || !hasInitialized) {
    return <DashboardPageLoader label="Loading student profile..." />;
  }

  function handleStartEditing() {
    setIsEditing(true);
  }

  function handleCancelEditing() {
    if (isSaving || isUploading) {
      return;
    }

    setDisplayName(initialDisplayName);
    setProfileImageUrl(initialProfileImageUrl);
    setPendingUploadedImage(null);
    setIsEditing(false);
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
      setIsEditing(false);
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
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Student Profile
          </p>
          <h2 className="mt-2 font-headline text-[2rem] font-bold text-primary">
            Your Profile
          </h2>
        </div>
        <div className="flex shrink-0 gap-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancelEditing}
                disabled={isSaving || isUploading}
                className="inline-flex items-center gap-2 rounded-2xl border border-outline-variant/20 bg-surface px-4 py-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                form="student-profile-form"
                type="submit"
                disabled={isSaving || isUploading || !hasChanges}
                className="rounded-2xl bg-primary px-5 py-2.5 text-[13px] font-bold text-on-primary transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleStartEditing}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-[13px] font-bold text-on-primary transition-transform hover:-translate-y-0.5"
            >
              <PencilLine className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>
      </div>

      <form id="student-profile-form" onSubmit={handleSave} className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[280px_1fr] xl:items-center">
          <div className="flex flex-col items-center justify-center text-center xl:min-h-full">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-4">
                {profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileImageUrl}
                    alt=""
                    className="h-40 w-40 rounded-full object-cover shadow-[0px_12px_28px_rgba(0,51,88,0.12)]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="theme-primary-soft-icon flex h-40 w-40 items-center justify-center rounded-full shadow-[0px_12px_28px_rgba(0,51,88,0.12)]">
                    <UserRound className="h-16 w-16" />
                  </div>
                )}
              </div>

              {isEditing ? (
                <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary/90">
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
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-outline-variant/20 bg-surface px-4 py-4">
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

            <div className="rounded-2xl border border-outline-variant/20 bg-surface px-4 py-4">
              <div className="flex items-center gap-2 text-secondary">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                  Verification
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-primary">
                {session?.user.emailVerified ? "Email verified" : "Email not verified"}
              </p>
            </div>

            <div className="rounded-2xl border border-outline-variant/20 bg-surface px-4 py-4 md:col-span-2">
              <div className="flex items-center gap-2 text-secondary">
                <UserRound className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                  Name
                </span>
              </div>

              {isEditing ? (
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-2.5">
                  <UserRound className="h-5 w-5 text-secondary" />
                  <input
                    type="text"
                    value={displayName}
                    maxLength={80}
                    onChange={(event) => setDisplayName(event.target.value)}
                    className="w-full border-none bg-transparent text-[14px] text-on-surface outline-none focus:ring-0"
                    placeholder="Your full name"
                  />
                </div>
              ) : (
                <p className="mt-2 text-sm font-semibold text-primary">
                  {displayName || "No name added yet"}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-outline-variant/20 bg-surface px-4 py-4 md:col-span-2">
              <div className="flex items-center gap-2 text-secondary">
                <Mail className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                  Email
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-primary">
                {session?.user.email ?? "No email available"}
              </p>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
