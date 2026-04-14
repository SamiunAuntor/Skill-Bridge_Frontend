"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TutorAvailabilitySlot } from "@/types/tutor";

type TutorBookingSidebarProps = {
  tutorId: string;
  hourlyRate: number;
  availableSlots: TutorAvailabilitySlot[];
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
    const date = new Date(slot.startTime);
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

export default function TutorBookingSidebar({
  tutorId,
  hourlyRate,
  availableSlots,
}: TutorBookingSidebarProps) {
  const groupedSlots = useMemo(
    () => groupSlotsByDate(availableSlots).slice(0, 7),
    [availableSlots]
  );
  const [selectedDateKey, setSelectedDateKey] = useState(
    groupedSlots[0]?.dateKey ?? ""
  );
  const [selectedSlotId, setSelectedSlotId] = useState(
    groupedSlots[0]?.slots[0]?.id ?? ""
  );

  const selectedDate =
    groupedSlots.find((group) => group.dateKey === selectedDateKey) ??
    groupedSlots[0];

  return (
    <aside className="lg:col-span-4">
      <div className="overflow-hidden rounded-[1.35rem] border border-outline-variant/10 bg-surface-container-lowest shadow-[0px_24px_48px_rgba(0,51,88,0.08)] lg:sticky lg:top-28">
        <div className="flex items-end justify-between bg-primary p-8 text-on-primary">
          <div>
            <p className="font-headline text-5xl font-black">
              {formatCurrency(hourlyRate)}
              <span className="ml-1 text-sm font-semibold text-on-primary-container">
                / 60 min session
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            Instant Booking
          </div>
        </div>

        <div className="space-y-8 p-8">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline text-base font-bold text-primary">
                Select Date
              </h3>
              <span className="text-xs font-semibold text-secondary">
                {selectedDate?.dayLabel ?? "No dates"}
              </span>
            </div>

            {groupedSlots.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
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
                      className={`rounded-xl border px-3 py-3 text-center transition-colors ${
                        isActive
                          ? "border-secondary bg-secondary-container text-on-secondary-container ring-2 ring-secondary/30"
                          : "border-outline-variant/20 bg-surface text-primary hover:bg-surface-container-low"
                      }`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em]">
                        {group.weekdayLabel}
                      </p>
                      <p className="mt-1 font-headline text-xl font-extrabold">
                        {group.dayNumber}
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em]">
                        {group.monthLabel}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl bg-surface-container-low p-5 text-sm text-on-surface-variant">
                No upcoming slots are available yet.
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-4 font-headline text-base font-bold text-primary">
              Available Slots
            </h3>
            {selectedDate && selectedDate.slots.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {selectedDate.slots.map((slot) => {
                  const isActive = selectedSlotId === slot.id;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                        isActive
                          ? "border-primary bg-primary text-on-primary shadow-sm"
                          : "border-outline-variant/20 bg-surface text-on-surface-variant hover:bg-surface-container-low"
                      }`}
                    >
                      {formatTimeLabel(slot.startTime)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl bg-surface-container-low p-5 text-sm text-on-surface-variant">
                Select a date to see open time slots.
              </div>
            )}
          </section>

          <Link
            href={`/login?next=/tutors/${tutorId}`}
            className={`block rounded-xl px-4 py-4 text-center font-headline text-lg font-bold shadow-lg transition-all ${
              selectedSlotId
                ? "bg-gradient-to-r from-primary to-primary-container text-on-primary hover:shadow-xl"
                : "pointer-events-none bg-surface-container-high text-on-surface-variant"
            }`}
          >
            Book a Session
          </Link>

          <p className="flex items-center justify-center gap-2 text-center text-xs font-medium text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            Secure payment &amp; 100% Satisfaction Guarantee
          </p>
        </div>
      </div>
    </aside>
  );
}
