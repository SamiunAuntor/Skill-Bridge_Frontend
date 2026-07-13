"use client";

import { CalendarDays, ChevronDown, Eye, Inbox, Mail, Search, UserRound, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { ContactStatus, ContactSubmission, getAdminContactSubmissions, updateAdminContactStatus } from "@/lib/contact-api";
import { buildAdminListUrl, parsePositiveInt } from "@/lib/admin-list-query";

const statuses: ContactStatus[] = ["new", "read", "resolved"];
const defaultQuery = {
  q: "",
  status: "all" as "all" | ContactStatus,
  sortBy: "newest" as "newest" | "oldest",
  page: 1,
  limit: 10,
};

function parseQuery(searchParams: URLSearchParams) {
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sortBy");
  return {
    q: searchParams.get("q") ?? "",
    status: statuses.includes(status as ContactStatus) ? status as ContactStatus : "all" as const,
    sortBy: sortBy === "oldest" ? "oldest" as const : "newest" as const,
    page: parsePositiveInt(searchParams.get("page"), 1),
    limit: 10,
  };
}

export default function AdminContactSubmissionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(() => parseQuery(new URLSearchParams(searchParams.toString())), [searchParams]);
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [input, setInput] = useState(query.q);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);

  useEffect(() => { setInput(query.q); }, [query.q]);

  function updateQuery(next: Partial<typeof defaultQuery>) {
    const merged = { ...query, ...next };
    router.replace(buildAdminListUrl({
      pathname,
      searchParams: new URLSearchParams(searchParams.toString()),
      values: { q: merged.q, status: merged.status, sortBy: merged.sortBy, page: merged.page, limit: 10 },
      defaults: defaultQuery,
    }), { scroll: false });
  }

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const result = await getAdminContactSubmissions({ q: query.q || undefined, status: query.status === "all" ? undefined : query.status, sortBy: query.sortBy, page: query.page, limit: query.limit });
      setItems(result.items); setMeta({ total: result.meta.total, totalPages: result.meta.totalPages });
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load messages."); }
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => { void load(); }, [load]);

  async function changeStatus(item: ContactSubmission, next: ContactStatus, notify = true) {
    if (item.status === next) return;
    setUpdatingId(item.id);
    try {
      const updated = await updateAdminContactStatus(item.id, next);
      setItems((current) => current.map((entry) => entry.id === item.id ? updated : entry));
      setSelected((current) => current?.id === item.id ? updated : current);
      if (notify) {
        await Swal.fire({
          icon: "success",
          title: "Status updated",
          text: `The message is now marked as ${next}.`,
          confirmButtonColor: "#1d3b66",
          timer: 1800,
          timerProgressBar: true,
        });
      }
    } catch (reason) {
      await Swal.fire({ icon: "error", title: "Status update failed", text: reason instanceof Error ? reason.message : "Unable to update this message.", confirmButtonColor: "#1d3b66" });
    } finally { setUpdatingId(null); }
  }

  async function view(item: ContactSubmission) {
    setSelected(item);
    if (item.status === "new") await changeStatus(item, "read", false);
  }

  return (
    <div className="space-y-6">
      <header className="rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_18px_40px_rgba(0,51,88,0.08)]">
        <div className="flex items-center gap-3 text-secondary"><Inbox className="h-5 w-5" /><p className="text-xs font-bold uppercase tracking-[0.18em]">Contact inbox</p></div>
        <h1 className="mt-3 font-headline text-3xl font-extrabold text-primary">Contact submissions</h1>
        <p className="mt-2 text-on-surface-variant">Review and resolve messages sent through the public Contact page.</p>
      </header>
      <section className="rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-[0_18px_40px_rgba(0,51,88,0.06)]">
        <form onSubmit={(event: FormEvent) => { event.preventDefault(); updateQuery({ q: input.trim(), page: 1 }); }} className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-on-surface-variant" /><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search sender, subject, or message" className="h-11 w-full rounded-xl border border-outline-variant/30 bg-surface-container-low pl-10 pr-4 text-sm text-on-surface outline-none focus:border-primary" /></div>
          <div className="relative">
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <select value={query.status} onChange={(e) => updateQuery({ status: e.target.value as typeof query.status, page: 1 })} className="h-11 appearance-none rounded-xl border border-outline-variant/30 bg-surface-container-low pl-9 pr-4 text-sm text-on-surface"><option value="all">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select>
          </div>
          <div className="relative">
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <select value={query.sortBy} onChange={(e) => updateQuery({ sortBy: e.target.value as "newest" | "oldest", page: 1 })} className="h-11 appearance-none rounded-xl border border-outline-variant/30 bg-surface-container-low pl-9 pr-4 text-sm text-on-surface"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select>
          </div>
          <button className="h-11 rounded-xl bg-primary px-5 text-sm font-bold text-on-primary">Search</button>
        </form>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead><tr className="border-b border-outline-variant/25 text-xs uppercase tracking-wider text-on-surface-variant"><th className="px-3 py-4">Sender</th><th className="px-3 py-4">Subject</th><th className="px-3 py-4">Received</th><th className="px-3 py-4">Update status</th><th className="px-3 py-4 text-right">Action</th></tr></thead>
            <tbody>{items.map((item) => <tr key={item.id} className="border-b border-outline-variant/15"><td className="px-3 py-4"><p className="font-semibold text-primary">{item.name}</p><p className="mt-1 text-xs text-on-surface-variant">{item.email}</p></td><td className="max-w-xs px-3 py-4"><p className="truncate font-medium text-on-surface">{item.subject}</p><p className="mt-1 truncate text-xs text-on-surface-variant">{item.message}</p></td><td className="px-3 py-4 text-on-surface-variant">{formatDate(item.createdAt, "medium")}</td><td className="px-3 py-4"><StatusButtons item={item} busy={updatingId === item.id} onChange={(next) => void changeStatus(item, next)} /></td><td className="px-3 py-4 text-right"><button type="button" onClick={() => void view(item)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 font-semibold text-on-primary"><Eye className="h-4 w-4" /> View</button></td></tr>)}</tbody>
          </table>
          {loading ? <p className="py-12 text-center text-on-surface-variant">Loading messages...</p> : null}{!loading && !items.length ? <p className="py-12 text-center text-on-surface-variant">No messages match these filters.</p> : null}{error ? <p role="alert" className="my-5 rounded-xl bg-error-container p-4 text-on-error-container">{error}</p> : null}
        </div>
        <div className="mt-5 flex flex-col gap-3 border-t border-outline-variant/20 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-on-surface-variant">{meta.total} total messages</p><div className="flex items-center gap-3"><button disabled={query.page <= 1 || loading} onClick={() => updateQuery({ page: query.page - 1 })} className="rounded-lg border border-outline-variant/30 px-4 py-2 text-sm font-semibold text-primary disabled:opacity-40">Previous</button><span className="text-sm text-on-surface-variant">Page {query.page} of {meta.totalPages}</span><button disabled={query.page >= meta.totalPages || loading} onClick={() => updateQuery({ page: query.page + 1 })} className="rounded-lg border border-outline-variant/30 px-4 py-2 text-sm font-semibold text-primary disabled:opacity-40">Next</button></div></div>
      </section>
      {selected ? <MessageModal item={selected} busy={updatingId === selected.id} onClose={() => setSelected(null)} onChange={(next) => void changeStatus(selected, next)} /> : null}
    </div>
  );
}

function StatusButtons({ item, busy, onChange }: { item: ContactSubmission; busy: boolean; onChange: (status: ContactStatus) => void }) {
  return <div className="inline-flex flex-wrap gap-1.5">{statuses.map((status) => <button key={status} type="button" disabled={busy || item.status === status} onClick={() => onChange(status)} className={`rounded-lg px-2.5 py-1.5 text-xs font-bold capitalize transition ${item.status === status ? "bg-primary text-on-primary" : "border border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:border-secondary hover:text-secondary"} disabled:cursor-not-allowed disabled:opacity-70`}>{status}</button>)}</div>;
}

function MessageModal({ item, busy, onClose, onChange }: { item: ContactSubmission; busy: boolean; onClose: () => void; onChange: (status: ContactStatus) => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="message-title" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] border border-outline-variant/20 bg-surface-container-lowest shadow-[0_30px_90px_rgba(0,0,0,0.3)]"><header className="flex items-start justify-between gap-5 border-b border-outline-variant/20 bg-surface-container-low px-6 py-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Contact message</p><h2 id="message-title" className="mt-2 break-words font-headline text-2xl font-extrabold text-primary">{item.subject}</h2></div><button onClick={onClose} aria-label="Close message" className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-2 text-on-surface-variant"><X className="h-5 w-5" /></button></header><div className="overflow-y-auto p-6"><div className="grid gap-3 sm:grid-cols-2"><Info icon={UserRound} label="Sender" value={item.name} /><Info icon={Mail} label="Email" value={item.email} email /><div className="sm:col-span-2"><Info icon={CalendarDays} label="Received" value={formatDate(item.createdAt, "long")} /></div></div><div className="mt-5 rounded-2xl border border-outline-variant/20 bg-surface p-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">Message</p><p className="mt-4 whitespace-pre-wrap break-words leading-7 text-on-surface">{item.message}</p></div></div><footer className="flex flex-col gap-3 border-t border-outline-variant/20 bg-surface-container-low px-6 py-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Update status</p><StatusButtons item={item} busy={busy} onChange={onChange} /></div><button onClick={onClose} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary">Close</button></footer></div></div>;
}

function Info({ icon: Icon, label, value, email = false }: { icon: typeof Mail; label: string; value: string; email?: boolean }) {
  return <div className="flex items-center gap-3 rounded-xl bg-surface-container-low p-4"><Icon className="h-5 w-5 shrink-0 text-secondary" /><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>{email ? <a href={`mailto:${value}`} className="mt-1 block truncate font-semibold text-primary hover:text-secondary">{value}</a> : <p className="mt-1 truncate font-semibold text-primary">{value}</p>}</div></div>;
}

function formatDate(value: string, dateStyle: "medium" | "long") { return new Intl.DateTimeFormat("en", { dateStyle, timeStyle: "short" }).format(new Date(value)); }
