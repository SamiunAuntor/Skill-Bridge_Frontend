"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Camera, Mail, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { updateMyStudentProfile } from "@/lib/student-profile-api";
import { uploadImage } from "@/lib/upload-image";

export default function StudentProfileSettings() {
  const { data: session } = authClient.useSession();
  const [displayName, setDisplayName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [initialDisplayName, setInitialDisplayName] = useState("");
  const [initialProfileImageUrl, setInitialProfileImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

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

  if (session?.user?.role && session.user.role !== "student") {
    return null;
  }

  const hasChanges = useMemo(() => {
    return (
      displayName.trim() !== initialDisplayName ||
      (profileImageUrl ?? null) !== (initialProfileImageUrl ?? null)
    );
  }, [displayName, initialDisplayName, initialProfileImageUrl, profileImageUrl]);

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      const uploaded = await uploadImage(file);

      setProfileImageUrl(uploaded.secureUrl);
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

    if (!hasChanges) {
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateMyStudentProfile({
        fullName: trimmedName,
        profileImageUrl: profileImageUrl ?? null,
      });

      const authSyncResult = await authClient.updateUser({
        name: result.profile.name,
        image: result.profile.image ?? undefined,
      });

      if (authSyncResult.error) {
        console.warn("Student profile saved, but auth session sync failed.", authSyncResult.error);
      }

      setInitialDisplayName(trimmedName);
      setInitialProfileImageUrl(profileImageUrl ?? null);

      await Swal.fire({
        icon: "success",
        title: "Profile updated",
        text: "Your student profile information has been saved.",
        confirmButtonColor: "#1d3b66",
      });
    } catch (error) {
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
                onChange={(event) => setDisplayName(event.target.value)}
                className="w-full border-none bg-transparent text-[13px] text-on-surface outline-none focus:ring-0"
                placeholder="Your full name"
              />
            </div>
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
