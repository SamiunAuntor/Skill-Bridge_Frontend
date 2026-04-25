import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  CalendarClock,
  Clock3,
  ExternalLink,
  ReceiptText,
  Star,
  Video,
} from "lucide-react";
import avatarImage from "@/assets/avatar.png";
import { formatLongDate, formatShortDate, formatTimeRange } from "@/lib/format/date";
import { DashboardSessionItem } from "@/types/tutor";
import { UserRole } from "@/types/auth";

type DashboardSessionCardProps = {
  item: DashboardSessionItem;
  role: UserRole;
  variant?: "compact" | "full";
  isPending?: boolean;
  onJoin?: (item: DashboardSessionItem) => void;
  onCancel?: (bookingId: string) => void;
  reviewActionLabel?: string;
  onReviewAction?: (item: DashboardSessionItem) => void;
};

function getCounterparty(role: UserRole, item: DashboardSessionItem) {
  return role === "tutor"
    ? {
        name: item.student.name,
        avatarUrl: item.student.avatarUrl,
        label: "Student",
      }
    : {
        name: item.tutor.name,
        avatarUrl: item.tutor.avatarUrl,
        label: "Tutor",
      };
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getStatusClasses(status: DashboardSessionItem["sessionStatus"]): string {
  switch (status) {
    case "scheduled":
      return "theme-primary-soft-surface";
    case "ongoing":
      return "theme-secondary-soft";
    case "completed":
      return "bg-[#d8f6e6] text-[#1f6a43] dark:bg-[#153828] dark:text-[#9ee2ba]";
    case "cancelled":
      return "bg-error-container text-on-error-container";
    default:
      return "bg-surface-container-high text-on-surface-variant";
  }
}

function CounterpartyAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  return (
    <div className="relative flex h-[56px] w-[56px] shrink-0 items-center justify-center overflow-hidden rounded-[1rem] bg-surface-container-highest shadow-[0px_6px_18px_rgba(0,51,88,0.08)]">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name}
          fill
          sizes="72px"
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <>
          <Image
            src={avatarImage}
            alt=""
            fill
            sizes="72px"
            className="object-cover opacity-20"
          />
          <span className="relative z-10 text-xl font-black tracking-tight text-primary">
            {getInitials(name)}
          </span>
        </>
      )}
    </div>
  );
}

export default function DashboardSessionCard({
  item,
  role,
  variant = "full",
  isPending = false,
  onJoin,
  onCancel,
  reviewActionLabel,
  onReviewAction,
}: DashboardSessionCardProps) {
  const counterpart = getCounterparty(role, item);
  const isCompact = variant === "compact";
  const showActions =
    item.canJoin || item.canCancel || Boolean(reviewActionLabel && onReviewAction);
  const tutorProfileHref = role === "student" ? `/tutors/${item.tutor.id}` : null;

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-outline-variant/16 bg-surface-container-low p-5 shadow-[0px_10px_24px_rgba(0,51,88,0.06)]">
      <div className="flex h-full flex-col gap-5">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <CounterpartyAvatar
              name={counterpart.name}
              avatarUrl={counterpart.avatarUrl}
            />

            <div className="min-w-0 flex-1">
              <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[0.68rem] font-medium uppercase tracking-[0.05em] text-on-surface-variant">
                    {counterpart.label}
                  </p>

                  <span
                    className={`inline-flex rounded-full px-1.5 py-[4px] text-[0.64rem] font-medium uppercase tracking-[0.05em] ${getStatusClasses(
                      item.sessionStatus
                    )}`}
                  >
                    {item.sessionStatus}
                  </span>
                </div>

                {tutorProfileHref ? (
                  <Link
                    href={tutorProfileHref}
                    className="block line-clamp-2 font-headline text-[1.1rem] font-extrabold leading-tight tracking-tight text-primary transition-colors hover:text-secondary"
                  >
                    {counterpart.name}
                  </Link>
                ) : (
                  <h3 className="line-clamp-2 font-headline text-[1.1rem] font-extrabold leading-tight tracking-tight text-primary">
                    {counterpart.name}
                  </h3>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-[0.8rem] text-on-surface-variant">
            <div className="flex items-start gap-2 text-secondary">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {item.subject.name}
                {item.subject.categoryName
                  ? ` · ${item.subject.categoryName}`
                  : ""}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{isCompact ? formatShortDate(item.sessionDate) : formatLongDate(item.sessionDate)}</span>
            </div>
            <div className="flex items-start gap-2">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formatTimeRange(item.startTime, item.endTime)}</span>
            </div>
            <div className="flex items-start gap-2">
              <ReceiptText className="mt-0.5 h-4 w-4 shrink-0" />
              <span>${item.priceAtBooking.toFixed(2)}</span>
            </div>
            {item.meetingProvider === "zoom" && isCompact ? (
              <div className="flex items-start gap-2">
                <Video className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Zoom session</span>
              </div>
            ) : null}
          </div>
        </div>

        {!isCompact && item.meetingProvider === "zoom" ? (
          <div className="rounded-[1.1rem] border border-outline-variant/16 bg-surface-container px-4 py-3 text-[10px] text-on-surface-variant">
            <div className="text-[0.9rem] font-semibold text-primary">Zoom Meeting</div>
            <div className="mt-2 space-y-1">
              <p>
                Meeting ID:{" "}
                <span className="font-semibold text-primary">
                  {item.meetingId ?? "Pending"}
                </span>
              </p>
              <p>
                Passcode:{" "}
                <span className="font-semibold text-primary">
                  {item.meetingPassword ?? "Not required"}
                </span>
              </p>
            </div>
          </div>
        ) : null}

        {showActions ? (
          <div className="mt-auto border-t border-outline-variant/18 pt-4">
            <div className="flex flex-wrap gap-3">
              {item.canJoin ? (
                <button
                  type="button"
                  onClick={() => onJoin?.(item)}
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-[1.1rem] bg-primary px-5 py-3 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ExternalLink className="h-4 w-4" />
                  Join Session
                </button>
              ) : null}

              {item.canCancel ? (
                <button
                  type="button"
                  onClick={() => onCancel?.(item.bookingId)}
                  disabled={isPending}
                  className="rounded-[1.1rem] border border-error/20 bg-error-container px-5 py-3 text-[13px] font-semibold text-on-error-container transition-colors hover:bg-error-container/85 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel Session
                </button>
              ) : null}

              {reviewActionLabel && onReviewAction ? (
                <button
                  type="button"
                  onClick={() => onReviewAction(item)}
                  disabled={isPending}
                  className="theme-secondary-soft inline-flex items-center justify-center gap-2 rounded-[1.1rem] px-5 py-3 text-[13px] font-semibold transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Star className="h-4 w-4 fill-current" />
                  {reviewActionLabel}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
