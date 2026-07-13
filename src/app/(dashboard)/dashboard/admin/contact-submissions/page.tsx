"use client";

import { Eye, Inbox, Search } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { ContactStatus, ContactSubmission, getAdminContactSubmissions, updateAdminContactStatus } from "@/lib/contact-api";

export default function AdminContactSubmissionsPage() {
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | ContactStatus>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminContactSubmissions({ q: query || undefined, status: status || undefined, sortBy, page, limit: 10 });
      setItems(result.items);
      setMeta({ total: result.meta.total, totalPages: result.meta.totalPages });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load messages.");
    } finally {
      setLoading(false);
    }
  }, [page, query, sortBy, status]);

  useEffect(() => { void load(); }, [load]);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setQuery(input.trim());
  }

  async function changeStatus(item: ContactSubmission, next: ContactStatus) {
    if (item.status === next) return;
    setUpdatingId(item.id);
    try {
      const updated = await updateAdminContactStatus(item.id, next);
      setItems((current) => current.map((entry) => entry.id === item.id ? updated : entry));
    } catch (reason) {
      await Swal.fire({ icon: "error", title: "Status update failed", text: reason instanceof Error ? reason.message : "Unable to update this message.", confirmButtonColor: "#1d3b66" });
    } finally {
      setUpdatingId(null);
    }
  }

  async function view(item: ContactSubmission) {
    await Swal.fire({ title: item.subject, text: `${item.message}\n\nFrom: ${item.name} (${item.email})`, confirmButtonText: "Close", confirmButtonColor: "#1d3b66", width: 700 });
    if (item.status === "new") await changeStatus(item, "read");
  }

  return (
    <div className="space-y-6">
      <header className="rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_18px_40px_rgba(0,51,88,0.08)]">
        <div className="flex items-center gap-3 text-secondary"><Inbox className="h-5 w-5" /><p className="text-xs font-bold uppercase tracking-[0.18em]">Contact inbox</p></div>
        <h1 className="mt-3 font-headline text-3xl font-extrabold text-primary">Contact submissions</h1>
        <p className="mt-2 text-on-surface-variant">Review and resolve messages sent through the public Contact page.</p>
      </header>
      <section className="rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-[0_18px_40px_rgba(0,51,88,0.06)]">
        <form onSubmit={search} className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-on-surface-variant" /><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search sender, subject, or message" className="h-11 w-full rounded-xl border border-outline-variant/30 bg-surface-container-low pl-10 pr-4 text-sm text-on-surface outline-none focus:border-primary" /></div>
          <select value={status} onChange={(e) => { setStatus(e.target.value as "" | ContactStatus); setPage(1); }} className="h-11 rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 text-sm text-on-surface"><option value="">All statuses</option><option value="new">New</option><option value="read">Read</option><option value="resolved">Resolved</option></select>
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value as "newest" | "oldest"); setPage(1); }} className="h-11 rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 text-sm text-on-surface"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select>
          <button className="h-11 rounded-xl bg-primary px-5 text-sm font-bold text-on-primary">Search</button>
        </form>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead><tr className="border-b border-outline-variant/25 text-xs uppercase tracking-wider text-on-surface-variant"><th className="px-3 py-4">Sender</th><th className="px-3 py-4">Subject</th><th className="px-3 py-4">Received</th><th className="px-3 py-4">Status</th><th className="px-3 py-4 text-right">Action</th></tr></thead>
            <tbody>{items.map((item) => <tr key={item.id} className="border-b border-outline-variant/15"><td className="px-3 py-4"><p className="font-semibold text-primary">{item.name}</p><p className="mt-1 text-xs text-on-surface-variant">{item.email}</p></td><td className="max-w-xs px-3 py-4"><p className="truncate font-medium text-on-surface">{item.subject}</p><p className="mt-1 truncate text-xs text-on-surface-variant">{item.message}</p></td><td className="px-3 py-4 text-on-surface-variant">{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</td><td className="px-3 py-4"><select aria-label={`Status for ${item.subject}`} value={item.status} disabled={updatingId === item.id} onChange={(e) => void changeStatus(item, e.target.value as ContactStatus)} className="rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2 capitalize text-on-surface"><option value="new">New</option><option value="read">Read</option><option value="resolved">Resolved</option></select></td><td className="px-3 py-4 text-right"><button onClick={() => void view(item)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 font-semibold text-on-primary"><Eye className="h-4 w-4" /> View</button></td></tr>)}</tbody>
          </table>
          {loading ? <p className="py-12 text-center text-on-surface-variant">Loading messages...</p> : null}
          {!loading && !items.length ? <p className="py-12 text-center text-on-surface-variant">No messages match these filters.</p> : null}
          {error ? <p role="alert" className="my-5 rounded-xl bg-error-container p-4 text-on-error-container">{error}</p> : null}
        </div>
        <div className="mt-5 flex flex-col gap-3 border-t border-outline-variant/20 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-on-surface-variant">{meta.total} total messages</p><div className="flex items-center gap-3"><button disabled={page <= 1 || loading} onClick={() => setPage((v) => v - 1)} className="rounded-lg border border-outline-variant/30 px-4 py-2 text-sm font-semibold text-primary disabled:opacity-40">Previous</button><span className="text-sm text-on-surface-variant">Page {page} of {meta.totalPages}</span><button disabled={page >= meta.totalPages || loading} onClick={() => setPage((v) => v + 1)} className="rounded-lg border border-outline-variant/30 px-4 py-2 text-sm font-semibold text-primary disabled:opacity-40">Next</button></div></div>
      </section>
    </div>
  );
}
