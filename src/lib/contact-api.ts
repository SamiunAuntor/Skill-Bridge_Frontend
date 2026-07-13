import { getApiBaseUrl } from "@/lib/api-url";

const apiBaseUrl = getApiBaseUrl();

type Envelope<T> = { success: boolean; message: string; data: T };

async function parse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | Envelope<T>
    | { message?: string }
    | null;
  if (!response.ok) {
    throw new Error(payload?.message || "Unable to complete this request.");
  }
  if (!payload || !("data" in payload)) throw new Error("Unexpected API response.");
  return payload.data;
}

export type ContactStatus = "new" | "read" | "resolved";
export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
};

export async function submitContact(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
}) {
  const response = await fetch(`${apiBaseUrl}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<{ id?: string; createdAt?: string; accepted?: boolean }>(response);
}

export async function getAdminContactSubmissions(filters: {
  q?: string;
  status?: ContactStatus;
  sortBy?: "newest" | "oldest";
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 10));
  const response = await fetch(
    `${apiBaseUrl}/api/admin/contact-submissions?${params.toString()}`,
    { credentials: "include", cache: "no-store" }
  );
  return parse<{
    items: ContactSubmission[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }>(response);
}

export async function updateAdminContactStatus(id: string, status: ContactStatus) {
  const response = await fetch(
    `${apiBaseUrl}/api/admin/contact-submissions/${id}/status`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }
  );
  return parse<ContactSubmission>(response);
}
