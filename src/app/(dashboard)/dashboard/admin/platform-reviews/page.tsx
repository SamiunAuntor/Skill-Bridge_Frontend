"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { Eye, EyeOff, Search, Star, Trash2 } from "lucide-react";
import {
  AdminApiError,
  deleteAdminPlatformReview,
  getAdminPlatformReviews,
  updateAdminPlatformReviewStatus,
} from "@/lib/admin-api";
import type {
  AdminPlatformReviewsResponse,
  AdminPlatformReviewSortOption,
  AdminPlatformReviewStatus,
} from "@/types/admin";
import {
  AdminCard,
  AdminErrorMessage,
  AdminIconActionButton,
  AdminLoadingMessage,
  AdminModal,
  AdminPageHeader,
  AdminPaginationControls,
  AdminSelectField,
  AdminTableEmpty,
} from "@/Components/Admin/AdminUi";
import { formatAdminDate } from "@/Components/Admin/admin-formatters";

const defaultQuery = {
  q: "",
  status: "all",
  sortBy: "newest" as AdminPlatformReviewSortOption,
  page: 1,
  limit: 10,
};

type PlatformReviewRow = AdminPlatformReviewsResponse["reviews"][number];

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseQueryParams(searchParams: URLSearchParams) {
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sortBy");

  return {
    q: searchParams.get("q") ?? defaultQuery.q,
    status:
      status === "visible" || status === "hidden"
        ? status
        : defaultQuery.status,
    sortBy:
      sortBy &&
      ["newest", "oldest", "rating_high", "rating_low"].includes(sortBy)
        ? (sortBy as AdminPlatformReviewSortOption)
        : defaultQuery.sortBy,
    page: parsePositiveInt(searchParams.get("page"), defaultQuery.page),
    limit: 10,
  };
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-secondary" aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < rating ? "fill-current" : ""}`}
        />
      ))}
    </div>
  );
}

export default function AdminPlatformReviewsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(() => parseQueryParams(searchParams), [searchParams]);
  const [data, setData] = useState<AdminPlatformReviewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionReviewId, setActionReviewId] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<PlatformReviewRow | null>(
    null
  );
  const [searchInput, setSearchInput] = useState(query.q);

  useEffect(() => {
    setSearchInput(query.q);
  }, [query.q]);

  function updateQuery(next: Partial<typeof defaultQuery>) {
    const params = new URLSearchParams(searchParams.toString());
    const merged = { ...query, ...next };

    if (merged.q.trim()) {
      params.set("q", merged.q.trim());
    } else {
      params.delete("q");
    }

    if (merged.status !== "all") {
      params.set("status", merged.status);
    } else {
      params.delete("status");
    }

    if (merged.sortBy !== defaultQuery.sortBy) {
      params.set("sortBy", merged.sortBy);
    } else {
      params.delete("sortBy");
    }

    if (merged.page > 1) {
      params.set("page", String(merged.page));
    } else {
      params.delete("page");
    }

    params.set("limit", "10");

    const nextUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(nextUrl, { scroll: false });
  }

  async function loadReviews() {
    setIsLoading(true);

    try {
      const result = await getAdminPlatformReviews({
        q: query.q || undefined,
        status:
          query.status === "all"
            ? undefined
            : (query.status as AdminPlatformReviewStatus),
        sortBy: query.sortBy,
        page: query.page,
        limit: query.limit,
      });

      setData(result);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof AdminApiError
          ? error.message
          : "We couldn't load platform reviews right now."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadReviews();
  }, [query]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateQuery({
      q: searchInput,
      page: 1,
    });
  }

  async function handleStatusChange(
    review: PlatformReviewRow,
    status: AdminPlatformReviewStatus
  ) {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: status === "visible" ? "Show this review publicly?" : "Hide this review?",
      text:
        status === "visible"
          ? "This review may appear on public SkillBridge pages."
          : "This review will be removed from public pages but kept in admin records.",
      showCancelButton: true,
      confirmButtonText: status === "visible" ? "Show review" : "Hide review",
      cancelButtonText: "Cancel",
      confirmButtonColor: status === "visible" ? "#1d3b66" : "#9f1d1d",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setActionReviewId(review.id);

    try {
      await updateAdminPlatformReviewStatus(review.id, status);
      await loadReviews();
      await Swal.fire({
        icon: "success",
        title: status === "visible" ? "Review visible" : "Review hidden",
        text:
          status === "visible"
            ? "This review can now appear on the public landing page."
            : "This review is now hidden from public areas.",
        confirmButtonColor: "#1d3b66",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Status update failed",
        text:
          error instanceof AdminApiError
            ? error.message
            : "We couldn't update this review right now.",
        confirmButtonColor: "#1d3b66",
      });
    } finally {
      setActionReviewId(null);
    }
  }

  async function handleDelete(review: PlatformReviewRow) {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete this review?",
      text: "This removes the review from admin and public views.",
      showCancelButton: true,
      confirmButtonText: "Delete review",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#9f1d1d",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setActionReviewId(review.id);

    try {
      await deleteAdminPlatformReview(review.id);
      await loadReviews();
      await Swal.fire({
        icon: "success",
        title: "Review deleted",
        text: "The platform review has been removed.",
        confirmButtonColor: "#1d3b66",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text:
          error instanceof AdminApiError
            ? error.message
            : "We couldn't delete this review right now.",
        confirmButtonColor: "#1d3b66",
      });
    } finally {
      setActionReviewId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Platform reviews" />

      <AdminCard title="Filters">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_repeat(2,minmax(0,1fr))]">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest py-3 pl-11 pr-4 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by reviewer, email, title, or message"
            />
          </form>
          <AdminSelectField
            value={query.status}
            onChange={(value) =>
              updateQuery({
                status: value as typeof query.status,
                page: 1,
              })
            }
          >
            <option value="all">Any visibility</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </AdminSelectField>
          <AdminSelectField
            value={query.sortBy}
            onChange={(value) =>
              updateQuery({
                sortBy: value as AdminPlatformReviewSortOption,
                page: 1,
              })
            }
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="rating_high">Highest rating</option>
            <option value="rating_low">Lowest rating</option>
          </AdminSelectField>
        </div>
      </AdminCard>

      <div className="mt-6">
        {errorMessage ? <AdminErrorMessage message={errorMessage} /> : null}

        {isLoading ? (
          <AdminLoadingMessage label="Loading platform reviews..." />
        ) : data && data.reviews.length > 0 ? (
          <AdminCard title="Review directory">
            <div className="overflow-x-auto">
              <table className="min-w-full border border-outline-variant/20 text-left">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                    <th className="border border-outline-variant/20 px-4 py-4">
                      Reviewer
                    </th>
                    <th className="border border-outline-variant/20 px-4 py-4">
                      Rating
                    </th>
                    <th className="border border-outline-variant/20 px-4 py-4">
                      Review
                    </th>
                    <th className="border border-outline-variant/20 px-4 py-4">
                      Status
                    </th>
                    <th className="border border-outline-variant/20 px-4 py-4">
                      Submitted
                    </th>
                    <th className="border border-outline-variant/20 px-4 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.reviews.map((review) => (
                    <tr key={review.id}>
                      <td className="border border-outline-variant/20 px-4 py-4">
                        <p className="font-semibold text-primary">
                          {review.user.name}
                        </p>
                        <p className="text-sm text-on-surface-variant">
                          {review.user.email}
                        </p>
                      </td>
                      <td className="border border-outline-variant/20 px-4 py-4">
                        <RatingStars rating={review.rating} />
                      </td>
                      <td className="max-w-md border border-outline-variant/20 px-4 py-4">
                        <p className="font-semibold text-primary">
                          {review.title || "Untitled review"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">
                          {review.message}
                        </p>
                      </td>
                      <td className="border border-outline-variant/20 px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                            review.status === "visible"
                              ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                              : "bg-surface-container-high text-on-surface-variant"
                          }`}
                        >
                          {review.status}
                        </span>
                      </td>
                      <td className="border border-outline-variant/20 px-4 py-4 text-sm text-on-surface-variant">
                        {formatAdminDate(review.createdAt)}
                      </td>
                      <td className="border border-outline-variant/20 px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <AdminIconActionButton
                            label="View review"
                            icon={<Eye className="h-4 w-4" />}
                            onClick={() => setSelectedReview(review)}
                          />
                          <AdminIconActionButton
                            label={
                              review.status === "visible"
                                ? "Hide review"
                                : "Show review"
                            }
                            variant={
                              review.status === "visible" ? "neutral" : "primary"
                            }
                            disabled={actionReviewId === review.id}
                            icon={
                              review.status === "visible" ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )
                            }
                            onClick={() =>
                              void handleStatusChange(
                                review,
                                review.status === "visible"
                                  ? "hidden"
                                  : "visible"
                              )
                            }
                          />
                          <AdminIconActionButton
                            label="Delete review"
                            variant="danger"
                            disabled={actionReviewId === review.id}
                            icon={<Trash2 className="h-4 w-4" />}
                            onClick={() => void handleDelete(review)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AdminPaginationControls
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onChange={(page) => updateQuery({ page })}
            />
          </AdminCard>
        ) : (
          <AdminTableEmpty
            title="No platform reviews match the current filters"
            description="Try clearing the search or changing the visibility filter."
          />
        )}
      </div>

      <AdminModal
        isOpen={Boolean(selectedReview)}
        title="Platform review"
        onClose={() => setSelectedReview(null)}
      >
        {selectedReview ? (
          <div className="space-y-5">
            <div>
              <p className="font-headline text-xl font-bold text-primary">
                {selectedReview.title || "Untitled review"}
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                By {selectedReview.user.name} · {selectedReview.user.email}
              </p>
            </div>
            <RatingStars rating={selectedReview.rating} />
            <p className="rounded-2xl bg-surface-container-lowest p-4 text-sm leading-relaxed text-on-surface-variant">
              {selectedReview.message}
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
              {selectedReview.status} · {formatAdminDate(selectedReview.createdAt)}
            </p>
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
}
