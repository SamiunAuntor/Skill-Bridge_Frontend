"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Lock } from "lucide-react";
import { useAppAuthSession } from "@/lib/auth";
import BookingConfirmationModal from "@/Components/Tutors/BookingConfirmationModal";
import {
  AvailabilityApiError,
  getTutorAvailability,
} from "@/lib/availability-api";
import { createPaymentIntent, PaymentApiError } from "@/lib/payment-api";
import { savePaymentCheckoutSession } from "@/lib/payment-checkout";
import { TutorAvailabilitySlot, TutorSubject } from "@/types/tutor";

type TutorBookingSidebarProps = {
  tutorId: string;
  hourlyRate: number;
  subjects: TutorSubject[];
};

type GroupedSlots = {
  dateKey: string;
  dayLabel: string;
  monthLabel: string;
  dayNumber: string;
  weekdayLabel: string;
  slots: TutorAvailabilitySlot[];
};

function formatCurrency(amount: number): string {
  return `$${Math.round(amount)}`;
}

function groupSlotsByDate(slots: TutorAvailabilitySlot[]): GroupedSlots[] {
  const groups = new Map<string, GroupedSlots>();

  for (const slot of slots) {
    const date = new Date(slot.startAt);
    const dateKey = date.toISOString().slice(0, 10);

    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        dateKey,
        dayLabel: new Intl.DateTimeFormat("en-BD", {
          month: "short",
          year: "numeric",
        }).format(date),
        monthLabel: new Intl.DateTimeFormat("en-BD", {
          month: "short",
        }).format(date),
        dayNumber: new Intl.DateTimeFormat("en-BD", {
          day: "numeric",
        }).format(date),
        weekdayLabel: new Intl.DateTimeFormat("en-BD", {
          weekday: "short",
        }).format(date),
        slots: [],
      });
    }

    groups.get(dateKey)?.slots.push(slot);
  }

  return [...groups.values()];
}

function formatTimeLabel(isoString: string): string {
  return new Intl.DateTimeFormat("en-BD", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

function formatDateLabel(isoString: string): string {
  return new Intl.DateTimeFormat("en-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoString));
}

function formatAmount(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function calculateSlotPrice(hourlyRate: number, slot: TutorAvailabilitySlot): number {
  const durationHours =
    (new Date(slot.endAt).getTime() - new Date(slot.startAt).getTime()) /
    (1000 * 60 * 60);

  return Number((hourlyRate * Math.max(durationHours, 0)).toFixed(2));
}

function toPaymentErrorMessage(error: unknown): string {
  if (error instanceof PaymentApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to start checkout right now.";
}

export default function TutorBookingSidebar({
  tutorId,
  hourlyRate,
  subjects,
}: TutorBookingSidebarProps) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useAppAuthSession();
  const [slots, setSlots] = useState<TutorAvailabilitySlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingPending, setIsBookingPending] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const groupedSlots = useMemo(
    () => groupSlotsByDate(slots).slice(0, 7),
    [slots]
  );
  const selectedSubject =
    subjects.find((item) => item.id === selectedSubjectId) ?? null;
  const [selectedDateKey, setSelectedDateKey] = useState(
    groupedSlots[0]?.dateKey ?? ""
  );
  const [selectedSlotId, setSelectedSlotId] = useState(
    groupedSlots[0]?.slots[0]?.id ?? ""
  );

  const selectedDate =
    groupedSlots.find((group) => group.dateKey === selectedDateKey) ??
    groupedSlots[0];
  const selectedSlot =
    selectedDate?.slots.find((slot) => slot.id === selectedSlotId) ??
    selectedDate?.slots[0] ??
    null;

  useEffect(() => {
    let isMounted = true;

    async function loadSlots(showErrorAlert = false) {
      try {
        if (isMounted) {
          setIsLoadingSlots(true);
        }

        const response = await getTutorAvailability(tutorId);

        if (isMounted) {
          setSlots(response.upcomingSlots);
        }
      } catch (error) {
        if (!isMounted || !showErrorAlert) {
          return;
        }

        const message =
          error instanceof AvailabilityApiError
            ? error.message
            : "Unable to load tutor availability right now.";

        await Swal.fire({
          icon: "error",
          title: "Availability unavailable",
          text: message,
          confirmButtonColor: "#1d3b66",
        });
      } finally {
        if (isMounted) {
          setIsLoadingSlots(false);
        }
      }
    }

    void loadSlots(false);

    function handleWindowFocus() {
      void loadSlots(false);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void loadSlots(false);
      }
    }

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [tutorId]);

  useEffect(() => {
    const nextDateKey = groupedSlots[0]?.dateKey ?? "";
    const currentDateStillExists = groupedSlots.some(
      (group) => group.dateKey === selectedDateKey
    );

    if (!currentDateStillExists) {
      setSelectedDateKey(nextDateKey);
      setSelectedSlotId(groupedSlots[0]?.slots[0]?.id ?? "");
      return;
    }

    const currentGroup = groupedSlots.find((group) => group.dateKey === selectedDateKey);
    const currentSlotStillExists = currentGroup?.slots.some(
      (slot) => slot.id === selectedSlotId
    );

    if (!currentSlotStillExists) {
      setSelectedSlotId(currentGroup?.slots[0]?.id ?? "");
    }
  }, [groupedSlots, selectedDateKey, selectedSlotId]);

  async function handleBookClick() {
    if (!selectedSlotId || !selectedSlot || isBookingPending) {
      return;
    }

    if (sessionPending) {
      return;
    }

    if (!session?.user) {
      router.push(`/login?next=/tutors/${tutorId}`);
      return;
    }

    if (session.user.role !== "student") {
      await Swal.fire({
        icon: "info",
        title: "Student booking only",
        text: "Only students can book tutor sessions from this page.",
        confirmButtonColor: "#1d3b66",
      });
      return;
    }

    if (!selectedSubject) {
      await Swal.fire({
        icon: "info",
        title: "Choose a subject",
        text: "Select the tutoring subject you want help with before booking a slot.",
        confirmButtonColor: "#1d3b66",
      });
      return;
    }

    setIsModalOpen(true);
  }

  function handleCloseModal() {
    if (isBookingPending) {
      return;
    }

    setIsModalOpen(false);
  }

  function handleConfirmBooking() {
    if (!selectedSlot || !selectedSubject) {
      return;
    }

    setIsBookingPending(true);

    void (async () => {
      try {
        const returnTo = `/tutors/${tutorId}`;
        const result = await createPaymentIntent({
          tutorId,
          subjectId: selectedSubject.id,
          slotId: selectedSlot.id,
        });

        savePaymentCheckoutSession(result.bookingId, returnTo, result);
        setIsModalOpen(false);
        router.push(
          `/payment/checkout/${encodeURIComponent(
            result.bookingId
          )}?payment_intent=${encodeURIComponent(
            result.paymentIntentId
          )}&next=${encodeURIComponent(returnTo)}`
        );
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Checkout unavailable",
          text: toPaymentErrorMessage(error),
          confirmButtonColor: "#1d3b66",
        });
      } finally {
        setIsBookingPending(false);
      }
    })();
  }

  return (
    <>
      <aside className="self-start lg:col-span-4 lg:flex lg:justify-end">
        <div className="w-full max-w-[21rem] overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-lowest shadow-[0px_18px_36px_rgba(0,51,88,0.08)]">
        <div className="bg-primary p-5 text-on-primary">
          <div>
            <p className="font-headline text-[2.2rem] font-black">
              {formatCurrency(hourlyRate)}
              <span className="ml-1 text-xs font-medium text-on-primary-container">
                /hr
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-headline text-[14px] font-bold text-primary">
                Select Subject
              </h3>
              <span className="text-[11px] font-semibold text-secondary">
                {selectedSubject?.categoryName ?? "Required"}
              </span>
            </div>

            {subjects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {subjects.map((subject) => {
                  const isActive = selectedSubjectId === subject.id;

                  return (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => setSelectedSubjectId(subject.id)}
                      className={`rounded-full px-3 py-2 text-[12px] font-semibold transition-colors ${
                        isActive
                          ? "bg-primary text-on-primary shadow-sm"
                          : "bg-surface-container-low text-primary hover:bg-surface-container"
                      }`}
                    >
                      {subject.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
                This tutor has not published any tutoring subjects yet.
              </div>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-headline text-[14px] font-bold text-primary">
                Select Date
              </h3>
              <span className="text-[11px] font-semibold text-secondary">
                {selectedDate?.dayLabel ?? "No dates"}
              </span>
            </div>

            {groupedSlots.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {groupedSlots.map((group) => {
                  const isActive = group.dateKey === selectedDate?.dateKey;

                  return (
                    <button
                      key={group.dateKey}
                      type="button"
                      onClick={() => {
                        setSelectedDateKey(group.dateKey);
                        setSelectedSlotId(group.slots[0]?.id ?? "");
                      }}
                      className={`rounded-md border px-2 py-2 text-center transition-colors ${
                        isActive
                          ? "border-secondary theme-secondary-soft ring-2 ring-secondary/20"
                          : "border-outline-variant/20 bg-surface text-primary hover:bg-surface-container-low"
                      }`}
                    >
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em]">
                        {group.weekdayLabel}
                      </p>
                      <p className="mt-1 font-headline text-lg font-extrabold">
                        {group.dayNumber}
                      </p>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em]">
                        {group.monthLabel}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
                {isLoadingSlots
                  ? "Loading upcoming slots..."
                  : "No upcoming slots are available yet."}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-3 font-headline text-[14px] font-bold text-primary">
              Available Slots
            </h3>
            {selectedDate && selectedDate.slots.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {selectedDate.slots.map((slot) => {
                  const isActive = selectedSlotId === slot.id;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`rounded-md border px-3.5 py-2.5 text-[12px] font-semibold transition-colors ${
                        isActive
                          ? "border-primary bg-primary text-on-primary shadow-sm"
                          : "border-outline-variant/20 bg-surface text-on-surface-variant hover:bg-surface-container-low"
                      }`}
                    >
                      {formatTimeLabel(slot.startAt)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
                {isLoadingSlots
                  ? "Loading time slots..."
                  : "Select a date to see open time slots."}
              </div>
            )}
          </section>

          <button
            type="button"
            onClick={() => void handleBookClick()}
            className={`block w-full rounded-md px-4 py-3 text-center font-headline text-[14px] font-bold shadow-lg transition-all ${
              selectedSlotId && selectedSubjectId && !sessionPending
                ? "bg-gradient-to-r from-primary to-primary-container text-on-primary hover:shadow-xl"
                : "pointer-events-none bg-surface-container-high text-on-surface-variant"
            }`}
          >
            {sessionPending ? "Checking account..." : "Book a Session"}
          </button>

          <p className="flex items-center justify-center gap-2.5 pt-2 text-center text-[10px] font-medium text-on-surface-variant">
            <Lock className="h-3.5 w-3.5" />
            Secure payment &amp; 100% Satisfaction Guarantee
          </p>
        </div>
      </div>
    </aside>

      <BookingConfirmationModal
        isOpen={isModalOpen && !!selectedSlot}
        subjectLabel={selectedSubject?.name ?? ""}
        dateLabel={selectedSlot ? formatDateLabel(selectedSlot.startAt) : ""}
        timeLabel={
          selectedSlot
            ? `${formatTimeLabel(selectedSlot.startAt)} - ${formatTimeLabel(selectedSlot.endAt)}`
            : ""
        }
        amountLabel={
          selectedSlot
            ? formatAmount(calculateSlotPrice(hourlyRate, selectedSlot))
            : ""
        }
        isSubmitting={isBookingPending}
        onClose={handleCloseModal}
        onConfirm={handleConfirmBooking}
      />
    </>
  );
}
