"use client";

import {
  useEffect,
  useMemo,
  useRef,
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
import type { AvailabilitySlotItem } from "@/types/tutor";

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

function formatTimeRange(startAt: string, endAt: string): string {
  return `${new Intl.DateTimeFormat("en-BD", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(startAt))} - ${new Intl.DateTimeFormat("en-BD", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(endAt))}`;
}

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

function getSlotStatus(slot: AvailabilitySlotItem) {
  if (slot.isBooked) {
    return {
      label: "Booked",
      helper: "A student has already reserved this slot.",
      badgeClass:
        "dark:bg-primary/20 dark:text-primary-fixed",
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
    badgeClass:
      "dark:bg-secondary/20 dark:text-secondary-fixed",
    containerClass:
      "border-outline-variant/15 bg-surface-container-lowest dark:bg-surface-container-low",
    lightBadgeStyle: {
      backgroundColor: "#bff4e6",
      color: "#0f5e55",
      borderColor: "#7fe2c8",
    },
  };
}

export default function TutorAvailabilitySettings() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => "light");
  const formSectionRef = useRef<HTMLElement | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlotItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  const groupedSlots = useMemo(() => groupSlotsByDate(slots), [slots]);

  useEffect(() => {
    let isMounted = true;

    async function loadAvailability(showAlert = false) {
      try {
        const response = await getMyAvailability();
        if (isMounted) {
          setSlots(response.slots);
        }
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

  function populateFormFromSlot(slot: AvailabilitySlotItem) {
    const startDate = new Date(slot.startAt);
    const endDate = new Date(slot.endAt);

    setEditingSlotId(slot.id);
    setSelectedDate(startDate.toISOString().slice(0, 10));
    setSelectedStartTime(
      `${String(startDate.getHours()).padStart(2, "0")}:${String(
        startDate.getMinutes()
      ).padStart(2, "0")}`
    );
    setSelectedEndTime(
      `${String(endDate.getHours()).padStart(2, "0")}:${String(
        endDate.getMinutes()
      ).padStart(2, "0")}`
    );

    requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function resetForm() {
    setEditingSlotId(null);
    setSelectedDate("");
    setSelectedStartTime("");
    setSelectedEndTime("");
  }

  async function handleCreateSlot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!selectedDate || !selectedStartTime || !selectedEndTime) {
      await Swal.fire({
        icon: "warning",
        title: "Missing slot details",
        text: "Choose a date, start time, and end time first.",
        confirmButtonColor: "#1d3b66",
      });
      return;
    }

    const startAt = new Date(`${selectedDate}T${selectedStartTime}`);
    const endAt = new Date(`${selectedDate}T${selectedEndTime}`);

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      await Swal.fire({
        icon: "error",
        title: "Invalid time selection",
        text: "Please choose a valid date and time range.",
        confirmButtonColor: "#1d3b66",
      });
      return;
    }

    if (startAt >= endAt) {
      await Swal.fire({
        icon: "warning",
        title: "Invalid slot range",
        text: "End time must be later than the start time.",
        confirmButtonColor: "#1d3b66",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      };

      if (editingSlotId) {
        const updatedSlot = await updateAvailabilitySlot(editingSlotId, payload);

        setSlots((currentSlots) =>
          currentSlots
            .map((currentSlot) =>
              currentSlot.id === updatedSlot.id ? updatedSlot : currentSlot
            )
            .sort(
              (left, right) =>
                new Date(left.startAt).getTime() - new Date(right.startAt).getTime()
            )
        );

        resetForm();

        await Swal.fire({
          icon: "success",
          title: "Availability updated",
          text: "The slot time has been updated successfully.",
          confirmButtonColor: "#1d3b66",
        });
      } else {
        const createdSlot = await createAvailabilitySlot(payload);

        setSlots((currentSlots) =>
          [...currentSlots, createdSlot].sort(
            (left, right) =>
              new Date(left.startAt).getTime() - new Date(right.startAt).getTime()
          )
        );
        resetForm();

        await Swal.fire({
          icon: "success",
          title: "Availability added",
          text: "The new time slot is now visible in your upcoming availability.",
          confirmButtonColor: "#1d3b66",
        });
      }
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: editingSlotId ? "Could not update slot" : "Could not create slot",
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

    if (!confirmation.isConfirmed) {
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await deleteAvailabilitySlot(slot.id);
      setSlots((currentSlots) =>
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
      <section
        ref={formSectionRef}
        className="rounded-[1.75rem] border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-[0px_16px_40px_rgba(0,51,88,0.08)]"
      >
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
              {slots.length}
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
              {editingSlotId ? (
                <Pencil className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isSubmitting
                ? editingSlotId
                  ? "Saving..."
                  : "Adding..."
                : editingSlotId
                ? "Save Changes"
                : "Add Slot"}
            </button>
            {editingSlotId ? (
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="inline-flex h-[54px] items-center justify-center gap-2 rounded-2xl border border-outline-variant/25 bg-surface px-5 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-[1.75rem] border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-[0px_16px_40px_rgba(0,51,88,0.08)]">
        <div className="mb-6">
          <h2 className="font-headline text-2xl font-bold text-primary">
            Upcoming Availability
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Students will see these future slots on your public profile.
          </p>
        </div>

        {isLoading ? (
          <DashboardPageLoader label="Loading availability..." />
        ) : groupedSlots.length > 0 ? (
          <div className="space-y-5">
            {groupedSlots.map((group) => (
              <div
                key={group.dateKey}
                className="rounded-2xl border border-outline-variant/20 bg-surface p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="font-headline text-lg font-bold text-primary">
                    {group.dateLabel}
                  </h3>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold dark:bg-secondary-container dark:text-on-secondary-container"
                    style={
                      theme === "dark"
                        ? undefined
                        : {
                            backgroundColor: "#d8fbf1",
                            color: "#0f766e",
                          }
                    }
                  >
                    {group.slots.length} slot{group.slots.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="space-y-3">
                  {group.slots.map((slot) => (
                    (() => {
                      const status = getSlotStatus(slot);

                      return (
                    <div
                      key={slot.id}
                      className={`flex flex-col gap-3 rounded-xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${status.containerClass}`}
                    >
                      <div>
                        <p className="font-semibold text-primary">
                          {formatTimeRange(slot.startAt, slot.endAt)}
                        </p>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          {status.helper}
                        </p>
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
                        {!slot.isBooked ? (
                          <button
                            type="button"
                            onClick={() => populateFormFromSlot(slot)}
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/25 bg-surface px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => void handleDeleteSlot(slot)}
                          disabled={isSubmitting || slot.isBooked}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-error-container px-4 py-2 text-sm font-semibold text-on-error-container transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#f3d9d7] disabled:text-[#9b6f6b] dark:disabled:bg-[#4c1d1d] dark:disabled:text-[#f0b7b2]"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                      );
                    })()
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-surface-container-low p-6 text-sm text-on-surface-variant">
            No availability slots yet. Add your first future slot above.
          </div>
        )}
      </section>
    </div>
  );
}
