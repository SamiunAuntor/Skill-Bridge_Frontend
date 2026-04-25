"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import Swal from "sweetalert2";
import { CalendarDays, Clock3, Pencil, Plus, Trash2, X } from "lucide-react";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";
import {
  AvailabilityApiError,
  createAvailabilitySlot,
  deleteAvailabilitySlot,
  getMyAvailability,
  updateAvailabilitySlot,
} from "@/lib/availability-api";
import { formatTimeRange } from "@/lib/format/date";
import type { AvailabilitySlotItem } from "@/types/tutor";

const MIN_SLOT_DURATION_MINUTES = 5;
const MAX_SLOT_DURATION_MINUTES = 180;

type GroupedAvailability = {
  dateKey: string;
  dateLabel: string;
  slots: AvailabilitySlotItem[];
};

type SlotVisualStatus = {
  label: string;
  helper: string;
  badgeClass: string;
  containerClass: string;
  lightBadgeStyle: {
    backgroundColor: string;
    color: string;
    borderColor: string;
  };
};

function groupSlotsByDate(slots: AvailabilitySlotItem[]): GroupedAvailability[] {
  const groups = new Map<string, GroupedAvailability>();

  for (const slot of slots) {
    const startDate = new Date(slot.startAt);
    const dateKey = startDate.toISOString().slice(0, 10);

    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        dateKey,
        dateLabel: new Intl.DateTimeFormat("en-BD", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(startDate),
        slots: [],
      });
    }

    groups.get(dateKey)?.slots.push(slot);
  }

  return [...groups.values()];
}

function toApiErrorMessage(error: unknown): string {
  if (error instanceof AvailabilityApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while updating availability.";
}

function subscribeTheme(callback: () => void) {
  window.addEventListener("themechange", callback);

  return () => {
    window.removeEventListener("themechange", callback);
  };
}

function getThemeSnapshot(): "light" | "dark" {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getSlotStatus(
  slot: AvailabilitySlotItem,
  isExpired = false
): SlotVisualStatus {
  if (isExpired) {
    return {
      label: "Expired",
      helper: slot.isBooked
        ? "This past slot was already reserved."
        : "This past slot is no longer visible to students.",
      badgeClass: "dark:bg-surface-container-high dark:text-on-surface-variant",
      containerClass:
        "border-outline-variant/15 bg-surface-container-low opacity-85 dark:bg-surface-container",
      lightBadgeStyle: {
        backgroundColor: "#e7ecf5",
        color: "#4a5d79",
        borderColor: "#d1d8e6",
      },
    };
  }

  if (slot.isBooked) {
    return {
      label: "Booked",
      helper: "A student has already reserved this slot.",
      badgeClass: "dark:bg-primary/20 dark:text-primary-fixed",
      containerClass:
        "border-primary/15 bg-primary-fixed/35 dark:border-primary/20 dark:bg-primary/10",
      lightBadgeStyle: {
        backgroundColor: "#c6d7f3",
        color: "#143a68",
        borderColor: "#9eb8e6",
      },
    };
  }

  return {
    label: "Open",
    helper: "Available for student booking.",
    badgeClass: "dark:bg-secondary/20 dark:text-secondary-fixed",
    containerClass:
      "border-outline-variant/15 bg-surface-container-lowest dark:bg-surface-container-low",
    lightBadgeStyle: {
      backgroundColor: "#bff4e6",
      color: "#0f5e55",
      borderColor: "#7fe2c8",
    },
  };
}

function toLocalDateInputValue(value: string): string {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toLocalTimeInputValue(value: string): string {
  const date = new Date(value);
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

function buildSlotDates(date: string, startTime: string, endTime: string) {
  const startAt = new Date(`${date}T${startTime}`);
  const endAt = new Date(`${date}T${endTime}`);
  return { startAt, endAt };
}

async function validateSlotRange(
  date: string,
  startTime: string,
  endTime: string
): Promise<{ startAt: Date; endAt: Date } | null> {
  if (!date || !startTime || !endTime) {
    await Swal.fire({
      icon: "warning",
      title: "Missing slot details",
      text: "Choose a date, start time, and end time first.",
      confirmButtonColor: "#1d3b66",
    });
    return null;
  }

  const { startAt, endAt } = buildSlotDates(date, startTime, endTime);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    await Swal.fire({
      icon: "error",
      title: "Invalid time selection",
      text: "Please choose a valid date and time range.",
      confirmButtonColor: "#1d3b66",
    });
    return null;
  }

  if (startAt >= endAt) {
    await Swal.fire({
      icon: "warning",
      title: "Invalid slot range",
      text: "End time must be later than the start time.",
      confirmButtonColor: "#1d3b66",
    });
    return null;
  }

  const durationMinutes = (endAt.getTime() - startAt.getTime()) / (1000 * 60);

  if (durationMinutes < MIN_SLOT_DURATION_MINUTES) {
    await Swal.fire({
      icon: "warning",
      title: "Slot is too short",
      text: `Availability must be at least ${MIN_SLOT_DURATION_MINUTES} minutes long.`,
      confirmButtonColor: "#1d3b66",
    });
    return null;
  }

  if (durationMinutes > MAX_SLOT_DURATION_MINUTES) {
    await Swal.fire({
      icon: "warning",
      title: "Slot is too long",
      text: "Availability cannot be longer than 3 hours.",
      confirmButtonColor: "#1d3b66",
    });
    return null;
  }

  return { startAt, endAt };
}

export default function TutorAvailabilitySettings() {
  const theme: "light" | "dark" = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    () => "light"
  );
  const [allSlots, setAllSlots] = useState<AvailabilitySlotItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlotItem | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const upcomingSlots = useMemo(
    () =>
      allSlots
        .filter((slot) => new Date(slot.startAt).getTime() > currentTime)
        .sort(
          (left, right) =>
            new Date(left.startAt).getTime() - new Date(right.startAt).getTime()
        ),
    [allSlots, currentTime]
  );
  const expiredSlots = useMemo(
    () =>
      allSlots
        .filter((slot) => new Date(slot.startAt).getTime() <= currentTime)
        .sort(
          (left, right) =>
            new Date(right.startAt).getTime() - new Date(left.startAt).getTime()
        ),
    [allSlots, currentTime]
  );
  const groupedUpcomingSlots = useMemo(
    () => groupSlotsByDate(upcomingSlots),
    [upcomingSlots]
  );
  const groupedExpiredSlots = useMemo(
    () => groupSlotsByDate(expiredSlots),
    [expiredSlots]
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadAvailability(showAlert = false) {
      try {
        const response = await getMyAvailability();
        if (!isMounted) {
          return;
        }

        setAllSlots([...response.upcomingSlots, ...response.expiredSlots]);
      } catch (error) {
        if (isMounted && showAlert) {
          void Swal.fire({
            icon: "error",
            title: "Availability unavailable",
            text: toApiErrorMessage(error),
            confirmButtonColor: "#1d3b66",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAvailability();

    function handleWindowFocus() {
      void loadAvailability(false);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void loadAvailability(false);
      }
    }

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  function resetAddForm() {
    setSelectedDate("");
    setSelectedStartTime("");
    setSelectedEndTime("");
  }

  function openEditModal(slot: AvailabilitySlotItem) {
    setEditingSlot(slot);
    setEditDate(toLocalDateInputValue(slot.startAt));
    setEditStartTime(toLocalTimeInputValue(slot.startAt));
    setEditEndTime(toLocalTimeInputValue(slot.endAt));
  }

  function closeEditModal() {
    if (isSubmitting) {
      return;
    }

    setEditingSlot(null);
    setEditDate("");
    setEditStartTime("");
    setEditEndTime("");
  }

  async function handleCreateSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validatedRange = await validateSlotRange(
      selectedDate,
      selectedStartTime,
      selectedEndTime
    );

    if (!validatedRange) {
      return;
    }

    setIsSubmitting(true);

    try {
      const createdSlot = await createAvailabilitySlot({
        startAt: validatedRange.startAt.toISOString(),
        endAt: validatedRange.endAt.toISOString(),
      });

      setAllSlots((currentSlots) =>
        [...currentSlots, createdSlot].sort(
          (left, right) =>
            new Date(left.startAt).getTime() - new Date(right.startAt).getTime()
        )
      );
      resetAddForm();

      await Swal.fire({
        icon: "success",
        title: "Availability added",
        text: "The new time slot is now visible in your upcoming availability.",
        confirmButtonColor: "#1d3b66",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Could not create slot",
        text: toApiErrorMessage(error),
        confirmButtonColor: "#1d3b66",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveEditedSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingSlot || isSubmitting) {
      return;
    }

    const validatedRange = await validateSlotRange(editDate, editStartTime, editEndTime);

    if (!validatedRange) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedSlot = await updateAvailabilitySlot(editingSlot.id, {
        startAt: validatedRange.startAt.toISOString(),
        endAt: validatedRange.endAt.toISOString(),
      });

      setAllSlots((currentSlots) =>
        currentSlots
          .map((currentSlot) =>
            currentSlot.id === updatedSlot.id ? updatedSlot : currentSlot
          )
          .sort(
            (left, right) =>
              new Date(left.startAt).getTime() - new Date(right.startAt).getTime()
          )
      );

      closeEditModal();

      await Swal.fire({
        icon: "success",
        title: "Availability updated",
        text: "The slot time has been updated successfully.",
        confirmButtonColor: "#1d3b66",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Could not update slot",
        text: toApiErrorMessage(error),
        confirmButtonColor: "#1d3b66",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteSlot(slot: AvailabilitySlotItem) {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete this slot?",
      text: `Remove ${formatTimeRange(slot.startAt, slot.endAt)} from your availability?`,
      showCancelButton: true,
      confirmButtonText: "Delete slot",
      cancelButtonText: "Keep slot",
      confirmButtonColor: "#b42318",
      cancelButtonColor: "#1d3b66",
    });

    if (!confirmation.isConfirmed || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await deleteAvailabilitySlot(slot.id);
      setAllSlots((currentSlots) =>
        currentSlots.filter((currentSlot) => currentSlot.id !== slot.id)
      );

      await Swal.fire({
        icon: "success",
        title: "Slot removed",
        text: "The selected availability slot has been deleted.",
        confirmButtonColor: "#1d3b66",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Could not delete slot",
        text: toApiErrorMessage(error),
        confirmButtonColor: "#1d3b66",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-[0px_16px_40px_rgba(0,51,88,0.08)]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary">
              Set Your Availability
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
              Add future slots that students can see on your public tutor profile.
            </p>
          </div>
          <div className="flex min-w-[140px] flex-col items-center justify-center rounded-2xl bg-primary-fixed px-4 py-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-primary-fixed-variant">
              Upcoming Slots
            </p>
            <p className="mt-1 font-headline text-3xl font-black text-primary">
              {upcomingSlots.length}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCreateSlot}
          className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_1fr_auto]"
        >
          <label className="space-y-2">
            <span className="text-sm font-semibold text-primary">Date</span>
            <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface px-4 py-3">
              <CalendarDays className="h-5 w-5 text-secondary" />
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full border-none bg-transparent text-sm text-on-surface outline-none focus:ring-0"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-primary">Start Time</span>
            <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface px-4 py-3">
              <Clock3 className="h-5 w-5 text-secondary" />
              <input
                type="time"
                value={selectedStartTime}
                onChange={(event) => setSelectedStartTime(event.target.value)}
                className="w-full border-none bg-transparent text-sm text-on-surface outline-none focus:ring-0"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-primary">End Time</span>
            <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface px-4 py-3">
              <Clock3 className="h-5 w-5 text-secondary" />
              <input
                type="time"
                value={selectedEndTime}
                onChange={(event) => setSelectedEndTime(event.target.value)}
                className="w-full border-none bg-transparent text-sm text-on-surface outline-none focus:ring-0"
              />
            </div>
          </label>

          <div className="mt-auto flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-on-primary transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {isSubmitting ? "Adding..." : "Add Slot"}
            </button>
          </div>
        </form>
        <p className="mt-4 text-xs font-medium text-on-surface-variant">
          Slots must be between 5 minutes and 3 hours.
        </p>
      </section>

      <AvailabilitySection
        emptyMessage="No availability slots yet. Add your first future slot above."
        emptySubtitle="Students will see these future slots on your public profile."
        groups={groupedUpcomingSlots}
        isLoading={isLoading}
        onDeleteSlot={handleDeleteSlot}
        onEditSlot={openEditModal}
        sectionTitle="Upcoming Availability"
        subtitle="Students will see these future slots on your public profile."
        theme={theme}
      />

      <AvailabilitySection
        emptyMessage="No expired slots yet."
        emptySubtitle="Expired slots stay here for reference and no longer block new availability."
        groups={groupedExpiredSlots}
        isExpired
        isLoading={isLoading}
        onDeleteSlot={handleDeleteSlot}
        onEditSlot={openEditModal}
        sectionTitle="Expired Availability"
        subtitle="Past slots are shown here for reference only. They cannot be edited or deleted."
        theme={theme}
      />

      {editingSlot ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-8">
          <div className="w-full max-w-2xl rounded-[1.6rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0px_24px_60px_rgba(0,0,0,0.24)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-headline text-2xl font-bold text-primary">
                  Edit Availability Slot
                </h3>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Update the date and time range without leaving this section.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                disabled={isSubmitting}
                className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedSlot} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-primary">Date</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface px-4 py-3">
                    <CalendarDays className="h-5 w-5 text-secondary" />
                    <input
                      type="date"
                      value={editDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(event) => setEditDate(event.target.value)}
                      className="w-full border-none bg-transparent text-sm text-on-surface outline-none focus:ring-0"
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-primary">Start Time</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface px-4 py-3">
                    <Clock3 className="h-5 w-5 text-secondary" />
                    <input
                      type="time"
                      value={editStartTime}
                      onChange={(event) => setEditStartTime(event.target.value)}
                      className="w-full border-none bg-transparent text-sm text-on-surface outline-none focus:ring-0"
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-primary">End Time</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface px-4 py-3">
                    <Clock3 className="h-5 w-5 text-secondary" />
                    <input
                      type="time"
                      value={editEndTime}
                      onChange={(event) => setEditEndTime(event.target.value)}
                      className="w-full border-none bg-transparent text-sm text-on-surface outline-none focus:ring-0"
                    />
                  </div>
                </label>
              </div>

              <p className="text-xs font-medium text-on-surface-variant">
                Slots must be between 5 minutes and 3 hours.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isSubmitting}
                  className="rounded-xl border border-outline-variant/25 bg-surface px-4 py-2.5 text-[13px] font-semibold text-primary transition hover:bg-surface-container-low disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-bold text-on-primary transition hover:opacity-90 disabled:opacity-60"
                >
                  <Pencil className="h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AvailabilitySection({
  emptyMessage,
  emptySubtitle,
  groups,
  isExpired = false,
  isLoading,
  onDeleteSlot,
  onEditSlot,
  sectionTitle,
  subtitle,
  theme,
}: {
  emptyMessage: string;
  emptySubtitle: string;
  groups: GroupedAvailability[];
  isExpired?: boolean;
  isLoading: boolean;
  onDeleteSlot: (slot: AvailabilitySlotItem) => Promise<void>;
  onEditSlot: (slot: AvailabilitySlotItem) => void;
  sectionTitle: string;
  subtitle: string;
  theme: "light" | "dark";
}) {
  return (
    <section className="rounded-[1.75rem] border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-[0px_16px_40px_rgba(0,51,88,0.08)]">
      <div className="mb-6">
        <h2 className="font-headline text-2xl font-bold text-primary">{sectionTitle}</h2>
        <p className="mt-2 text-sm text-on-surface-variant">{subtitle}</p>
      </div>

      {isLoading ? (
        <DashboardPageLoader label="Loading availability..." />
      ) : groups.length > 0 ? (
        <div className="space-y-5">
          {groups.map((group) => (
            <div
              key={group.dateKey}
              className="rounded-2xl border border-outline-variant/20 bg-surface p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="font-headline text-lg font-bold text-primary">{group.dateLabel}</h3>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold dark:bg-secondary-container dark:text-on-secondary-container"
                  style={
                    theme === "dark"
                      ? undefined
                      : {
                          backgroundColor: isExpired ? "#e7ecf5" : "#d8fbf1",
                          color: isExpired ? "#4a5d79" : "#0f766e",
                        }
                  }
                >
                  {group.slots.length} slot{group.slots.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="space-y-3">
                {group.slots.map((slot) => {
                  const status = getSlotStatus(slot, isExpired);

                  return (
                    <div
                      key={slot.id}
                      className={`flex flex-col gap-3 rounded-xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${status.containerClass}`}
                    >
                      <div>
                        <p className="font-semibold text-primary">
                          {formatTimeRange(slot.startAt, slot.endAt)}
                        </p>
                        <p className="mt-1 text-xs text-on-surface-variant">{status.helper}</p>
                      </div>
                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.badgeClass}`}
                          style={
                            theme === "dark"
                              ? undefined
                              : {
                                  backgroundColor: status.lightBadgeStyle.backgroundColor,
                                  color: status.lightBadgeStyle.color,
                                  borderColor: status.lightBadgeStyle.borderColor,
                                }
                          }
                        >
                          {status.label}
                        </span>
                        {!slot.isBooked && !isExpired ? (
                          <button
                            type="button"
                            onClick={() => onEditSlot(slot)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/25 bg-surface px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-low"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                        ) : null}
                        {!isExpired ? (
                          <button
                            type="button"
                            onClick={() => void onDeleteSlot(slot)}
                            disabled={slot.isBooked}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-error-container px-4 py-2 text-sm font-semibold text-on-error-container transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#f3d9d7] disabled:text-[#9b6f6b] dark:disabled:bg-[#4c1d1d] dark:disabled:text-[#f0b7b2]"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-container-low p-6 text-sm text-on-surface-variant">
          <p>{emptyMessage}</p>
          <p className="mt-2 text-xs">{emptySubtitle}</p>
        </div>
      )}
    </section>
  );
}
