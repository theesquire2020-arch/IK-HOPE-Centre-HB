"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fmtDateTime, fmtKES, pct } from "@/lib/format";
import {
  BankIcon,
  CheckIcon,
  ClockIcon,
  DownloadIcon,
  EyeIcon,
  HeartIcon,
  SearchIcon,
  XIcon,
} from "@/components/icons";

/* ------------------------------- types ------------------------------- */

interface Donation {
  id: number;
  receiptCode: string;
  donorName: string;
  donorEmail: string | null;
  donorPhone: string | null;
  amountOriginal: string;
  currency: string;
  amountKes: number;
  rateUsed: string;
  method: string;
  status: string;
  providerRef: string | null;
  transferRef: string | null;
  message: string | null;
  hasProof: boolean;
  proofUrl: string | null;
  campaignTitle: string | null;
  thankYouSentAt: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

interface CampaignRow {
  id: number;
  slug: string;
  title: string;
  description: string;
  targetKes: number;
  raisedKes: number;
  status: string;
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
}

interface Overview {
  totalKes: number;
  totalCount: number;
  monthKes: number;
  monthCount: number;
  pendingBanks: number;
  pendingCampaigns: number;
  recent: Donation[];
}

const METHOD_LABEL: Record<string, string> = {
  mpesa: "M-PESA",
  airtel: "Airtel",
  bank: "Bank",
  card: "Card",
};

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-forest-100 text-forest-800",
    bank_pending: "bg-gold-100 text-gold-700",
    pending: "bg-cream-200 text-ink-600",
    failed: "bg-clay-500/15 text-clay-600",
    rejected: "bg-cream-200 text-ink-400 line-through",
  };
  const label: Record<string, string> = {
    confirmed: "Confirmed",
    bank_pending: "Bank pending",
    pending: "Processing",
    failed: "Failed",
    rejected: "Rejected",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 font-sans text-[11px] font-bold ${map[status] || "bg-cream-200 text-ink-600"}`}>
      {label[status] || status}
    </span>
  );
}

function unauthed(router: ReturnType<typeof useRouter>) {
  router.replace("/admin/login");
}

/* ------------------------------ overview ----------------------------- */

function OverviewPanel({ go }: { go: (t: string) => void }) {
  const [data, setData] = useState<Overview | null>(null);
  useEffect(() => {
    fetch("/api/admin/overview").then((r) => (r.ok ? r.json() : null)).then(setData).catch(() => {});
  }, []);
  if (!data) return <p className="py-10 text-center text-sm text-ink-400">Loading…</p>;
  const cards: [string, string, string][] = [
    ["All-time confirmed", fmtKES(data.totalKes), `${data.totalCount} gifts`],
    ["Last 30 days", fmtKES(data.monthKes), `${data.monthCount} gifts`],
    ["Bank transfers to verify", String(data.pendingBanks), "needs action"],
    ["Campaigns in review", String(data.pendingCampaigns), "pending approval"],
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([t, v, sub]) => (
          <div key={t} className="rounded-2xl border border-cream-200 bg-cream-50 p-5 shadow-sm">
            <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-ink-400">{t}</p>
            <p className="mt-2 font-display text-2xl font-semibold text-forest-900">{v}</p>
            <p className="mt-1 text-xs font-semibold text-ink-400">{sub}</p>
          </div>
        ))}
      </div>
      {data.pendingBanks > 0 || data.pendingCampaigns > 0 ? (
        <div className="flex flex-wrap gap-3 rounded-2xl border border-gold-300 bg-gold-100 p-4 text-sm text-ink-700">
          <span className="font-semibold">
            Action needed: {data.pendingBanks} bank transfer{data.pendingBanks === 1 ? "" : "s"},{" "}
            {data.pendingCampaigns} campaign{data.pendingCampaigns === 1 ? "" : "s"}.
          </span>
          <span className="flex gap-2">
            {data.pendingBanks > 0 ? (
              <button type="button" onClick={() => go("donations")} className="font-bold text-forest-800 underline underline-offset-2">
                Review donations
              </button>
            ) : null}
            {data.pendingCampaigns > 0 ? (
              <button type="button" onClick={() => go("campaigns")} className="font-bold text-forest-800 underline underline-offset-2">
                Review campaigns
              </button>
            ) : null}
          </span>
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-2xl border border-cream-200 bg-cream-50 shadow-sm">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-cream-200 font-sans text-[11px] font-bold uppercase tracking-wider text-ink-400">
              <th className="px-4 py-3">Receipt</th>
              <th className="px-4 py-3">Donor</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody className="font-sans text-xs">
            {data.recent.map((d) => (
              <tr key={d.id} className="border-b border-cream-100 last:border-0">
                <td className="px-4 py-3 font-bold text-forest-800">{d.receiptCode}</td>
                <td className="px-4 py-3">{d.donorName}</td>
                <td className="px-4 py-3">
                  {d.amountOriginal} {d.currency}
                  <span className="block text-[10px] text-ink-400">= {fmtKES(d.amountKes)}</span>
                </td>
                <td className="px-4 py-3">{METHOD_LABEL[d.method] || d.method}</td>
                <td className="px-4 py-3"><StatusChip status={d.status} /></td>
                <td className="px-4 py-3 text-ink-400">{fmtDateTime(d.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------------------- donations ----------------------------- */

function DonationsPanel({ onUnauth }: { onUnauth: () => void }) {
  const [rows, setRows] = useState<Donation[] | null>(null);
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [action, setAction] = useState<{ id: number; kind: "reject" | "thankyou"; text: string } | null>(null);
  const [flash, setFlash] = useState("");

  const load = useCallback(() => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (method) p.set("method", method);
    if (query) p.set("q", query);
    fetch(`/api/admin/donations?${p.toString()}`)
      .then(async (r) => {
        if (r.status === 401) { onUnauth(); return; }
        return r.json();
      })
      .then((d) => setRows(d as Donation[]))
      .catch(() => {});
  }, [status, method, query, onUnauth]);

  useEffect(load, [load]);

  async function act(id: number, a: "verify" | "reject" | "thankyou", note = "") {
    setBusyId(id);
    const res = await fetch(`/api/admin/donations/${id}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: a, note }),
    }).catch(() => null);
    setBusyId(null);
    setAction(null);
    if (!res) { setFlash("Network error — try again."); return; }
    if (res.status === 401) { onUnauth(); return; }
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) { setFlash(data.error || "Action failed."); return; }
    setFlash(a === "verify" ? "Donation verified & receipt sent." : a === "reject" ? "Transfer rejected." : "Thank-you message sent.");
    setTimeout(() => setFlash(""), 4000);
    load();
  }

  if (!rows) return <p className="py-10 text-center text-sm text-ink-400">Loading…</p>;

  const selCls =
    "rounded-xl border border-cream-300 bg-cream-50 px-3 py-2.5 font-sans text-xs font-semibold text-ink-700 focus:border-forest-600 focus:outline-none";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className={selCls}>
          <option value="">All statuses</option>
          <option value="bank_pending">Bank pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Processing</option>
          <option value="failed">Failed</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Filter by method" className={selCls}>
          <option value="">All methods</option>
          <option value="mpesa">M-PESA</option>
          <option value="airtel">Airtel Money</option>
          <option value="bank">Bank</option>
          <option value="card">Card</option>
        </select>
        <div className="relative min-w-44 flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setQuery(q)}
            placeholder="Search donor, receipt, email…"
            aria-label="Search donations"
            className="w-full rounded-xl border border-cream-300 bg-cream-50 py-2.5 pl-9 pr-3 font-sans text-xs focus:border-forest-600 focus:outline-none"
          />
        </div>
        <button type="button" onClick={() => setQuery(q)} className="rounded-xl bg-forest-800 px-4 py-2.5 font-sans text-xs font-bold text-cream-50 hover:bg-forest-700">
          Search
        </button>
      </div>

      {flash ? <p className="rounded-xl bg-forest-100 p-3 text-xs font-bold text-forest-900">{flash}</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-cream-200 bg-cream-50 shadow-sm">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-cream-200 font-sans text-[11px] font-bold uppercase tracking-wider text-ink-400">
              <th className="px-4 py-3">Receipt / Date</th>
              <th className="px-4 py-3">Donor</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="font-sans text-xs">
            {rows.map((d) => (
              <tr key={d.id} className="border-b border-cream-100 align-top last:border-0 hover:bg-cream-100/40">
                <td className="px-4 py-3">
                  <p className="font-bold text-forest-800">{d.receiptCode}</p>
                  <p className="text-[10px] text-ink-400">{fmtDateTime(d.createdAt)}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{d.donorName}</p>
                  <p className="text-[10px] text-ink-400">{d.donorEmail || d.donorPhone || "—"}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{d.amountOriginal} {d.currency}</p>
                  <p className="text-[10px] text-ink-400">= {fmtKES(d.amountKes)} · rate {d.rateUsed}</p>
                  {d.transferRef ? <p className="text-[10px] text-ink-400">ref {d.transferRef}</p> : null}
                </td>
                <td className="px-4 py-3">{METHOD_LABEL[d.method] || d.method}</td>
                <td className="max-w-36 px-4 py-3 text-ink-600">{d.campaignTitle || "General fund"}</td>
                <td className="px-4 py-3">
                  <StatusChip status={d.status} />
                  {d.thankYouSentAt ? (
                    <p className="mt-1 text-[10px] text-forest-600">thank-you sent</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  {action?.id === d.id ? (
                    <div className="flex w-56 flex-col gap-1.5">
                      <input
                        autoFocus
                        value={action.text}
                        onChange={(e) => setAction({ ...action, text: e.target.value })}
                        placeholder={action.kind === "reject" ? "Reason (optional)" : "Your thank-you message…"}
                        className="rounded-lg border border-cream-300 px-2.5 py-1.5 text-xs focus:border-forest-600 focus:outline-none"
                      />
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          disabled={busyId === d.id}
                          onClick={() => void act(d.id, action.kind, action.text)}
                          className="flex-1 rounded-lg bg-forest-800 px-2 py-1.5 text-[11px] font-bold text-cream-50 disabled:opacity-60"
                        >
                          {busyId === d.id ? "…" : action.kind === "reject" ? "Reject" : "Send"}
                        </button>
                        <button type="button" onClick={() => setAction(null)} className="rounded-lg border border-cream-300 px-2 py-1.5 text-[11px] font-bold text-ink-600">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {d.status === "bank_pending" ? (
                        <>
                          {d.hasProof && d.proofUrl ? (
                            <a href={d.proofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-cream-300 px-2.5 py-1.5 text-[11px] font-bold text-ink-700 hover:border-forest-600">
                              <EyeIcon className="h-3.5 w-3.5" /> Proof
                            </a>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => void act(d.id, "verify")}
                            className="inline-flex items-center gap-1 rounded-lg bg-forest-800 px-2.5 py-1.5 text-[11px] font-bold text-cream-50 hover:bg-forest-700"
                          >
                            <CheckIcon className="h-3.5 w-3.5" /> Verify
                          </button>
                          <button
                            type="button"
                            onClick={() => setAction({ id: d.id, kind: "reject", text: "" })}
                            className="inline-flex items-center gap-1 rounded-lg border border-clay-500/40 px-2.5 py-1.5 text-[11px] font-bold text-clay-600 hover:bg-clay-500/10"
                          >
                            <XIcon className="h-3.5 w-3.5" /> Reject
                          </button>
                        </>
                      ) : null}
                      {d.status === "confirmed" && !d.thankYouSentAt ? (
                        <button
                          type="button"
                          onClick={() =>
                            setAction({
                              id: d.id,
                              kind: "thankyou",
                              text: `Asante sana for your ${d.amountOriginal} ${d.currency} gift to ${d.campaignTitle ?? "IK Hope Centre"}. The children are grateful. — The team`,
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-gold-400 bg-gold-100 px-2.5 py-1.5 text-[11px] font-bold text-gold-700 hover:bg-gold-300/40"
                        >
                          <HeartIcon className="h-3.5 w-3.5" /> Thank you
                        </button>
                      ) : null}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink-400">
                  No donations match these filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-ink-400">
        Showing {rows.length} of the register. Full register is available via Export (CSV/PDF).
      </p>
    </div>
  );
}

/* ----------------------------- campaigns ----------------------------- */

function CampaignsPanel({ onUnauth }: { onUnauth: () => void }) {
  const [data, setData] = useState<{ pending: CampaignRow[]; active: CampaignRow[] } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [flash, setFlash] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/campaigns")
      .then(async (r) => {
        if (r.status === 401) { onUnauth(); return; }
        return r.json();
      })
      .then(setData)
      .catch(() => {});
  }, [onUnauth]);
  useEffect(load, [load]);

  async function act(id: number, a: "approve" | "reject") {
    setBusyId(id);
    const res = await fetch(`/api/admin/campaigns/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: a, reason }),
    }).catch(() => null);
    setBusyId(null);
    setRejectId(null);
    setReason("");
    if (!res) return;
    if (res.status === 401) { onUnauth(); return; }
    setFlash(a === "approve" ? "Campaign approved — public page is live." : "Campaign rejected.");
    setTimeout(() => setFlash(""), 4000);
    load();
  }

  if (!data) return <p className="py-10 text-center text-sm text-ink-400">Loading…</p>;

  return (
    <div className="space-y-6">
      {flash ? <p className="rounded-xl bg-forest-100 p-3 text-xs font-bold text-forest-900">{flash}</p> : null}

      <div>
        <h3 className="font-display text-lg font-semibold text-forest-900">
          Awaiting review ({data.pending.length})
        </h3>
        <div className="mt-3 space-y-4">
          {data.pending.length === 0 ? (
            <p className="rounded-2xl border border-cream-200 bg-cream-50 p-6 text-center text-sm text-ink-400">
              Nothing waiting. New fundraisers appear here for approval.
            </p>
          ) : (
            data.pending.map((c) => (
              <div key={c.id} className="rounded-2xl border border-gold-300 bg-gold-100/50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-base font-semibold text-forest-900">{c.title}</p>
                    <p className="mt-1 text-xs text-ink-600">
                      by {c.ownerName} · {c.ownerEmail} · goal {fmtKES(c.targetKes)} · {fmtDateTime(c.createdAt)}
                    </p>
                    <p className="mt-2 line-clamp-3 max-w-2xl text-xs leading-relaxed text-ink-700">{c.description}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={busyId === c.id}
                      onClick={() => void act(c.id, "approve")}
                      className="inline-flex items-center gap-1.5 rounded-full bg-forest-800 px-4 py-2 font-sans text-xs font-bold text-cream-50 hover:bg-forest-700 disabled:opacity-60"
                    >
                      <CheckIcon className="h-4 w-4" /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRejectId(rejectId === c.id ? null : c.id); setReason(""); }}
                      className="rounded-full border-2 border-clay-500/50 px-4 py-2 font-sans text-xs font-bold text-clay-600 hover:bg-clay-500/10"
                    >
                      Reject
                    </button>
                  </div>
                </div>
                {rejectId === c.id ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Reason shown to the fundraiser (optional)"
                      className="min-w-52 flex-1 rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-xs focus:border-forest-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={busyId === c.id}
                      onClick={() => void act(c.id, "reject")}
                      className="rounded-full bg-clay-600 px-4 py-2 font-sans text-xs font-bold text-cream-50 hover:bg-clay-500 disabled:opacity-60"
                    >
                      Confirm reject
                    </button>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold text-forest-900">
          Live campaigns ({data.active.length})
        </h3>
        <div className="mt-3 overflow-hidden rounded-2xl border border-cream-200 bg-cream-50">
          {data.active.map((c, i) => (
            <div key={c.id} className={`flex items-center justify-between gap-4 px-5 py-3.5 ${i > 0 ? "border-t border-cream-200" : ""}`}>
              <div className="min-w-0">
                <p className="truncate font-sans text-sm font-bold text-forest-900">{c.title}</p>
                <p className="truncate text-[11px] text-ink-400">/{c.slug}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-sans text-xs font-bold text-forest-800">
                  {fmtKES(c.raisedKes)} <span className="text-ink-400">/ {fmtKES(c.targetKes)}</span>
                </p>
                <p className="text-[11px] text-ink-400">{pct(c.raisedKes, c.targetKes)}%</p>
              </div>
            </div>
          ))}
          {data.active.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-400">No live campaigns yet.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- export ------------------------------ */

function ExportPanel() {
  const [busyPdf, setBusyPdf] = useState(false);
  const [msg, setMsg] = useState("");

  async function makePdf() {
    setBusyPdf(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/donations?limit=1000");
      if (!res.ok) throw new Error("fetch failed");
      const rows = (await res.json()) as Donation[];
      const { default: JsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new JsPDF({ orientation: "landscape", format: "a4" });
      doc.setFontSize(14);
      doc.setTextColor(18, 77, 48);
      doc.text("IK Hope Centre — Donation register", 14, 14);
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.text(
        `Generated ${new Date().toLocaleString("en-KE")} · ${rows.length} records · confidential — admin only`,
        14,
        20,
      );
      autoTable(doc, {
        startY: 26,
        head: [["Receipt", "Date", "Donor", "Email", "Phone", "Original", "KES", "Rate", "Method", "Status", "Campaign", "Ref"]],
        body: rows.map((d) => [
          d.receiptCode,
          fmtDateTime(d.createdAt),
          d.donorName,
          d.donorEmail ?? "",
          d.donorPhone ?? "",
          `${d.amountOriginal} ${d.currency}`,
          String(d.amountKes),
          d.rateUsed,
          d.method,
          d.status,
          d.campaignTitle ?? "General",
          d.providerRef ?? d.transferRef ?? "",
        ]),
        styles: { fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: [18, 77, 48], fontSize: 8 },
      });
      doc.save(`ikhope-donations-${new Date().toISOString().slice(0, 10)}.pdf`);
      setMsg("PDF generated.");
    } catch {
      setMsg("Could not generate the PDF.");
    } finally {
      setBusyPdf(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="rounded-2xl border border-cream-200 bg-cream-50 p-6 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-forest-900">CSV export</h3>
        <p className="mt-2 text-xs leading-relaxed text-ink-600">
          Full register with donor details, both currencies, the exact rate used, method and
          status. Rate-limited to 10 exports per hour.
        </p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <a href="/api/admin/export" className="inline-flex items-center gap-1.5 rounded-full bg-forest-800 px-5 py-2.5 font-sans text-xs font-bold text-cream-50 hover:bg-forest-700">
            <DownloadIcon className="h-4 w-4" /> All donations (CSV)
          </a>
          <a href="/api/admin/export?status=confirmed" className="inline-flex items-center gap-1.5 rounded-full border-2 border-forest-800 px-5 py-2.5 font-sans text-xs font-bold text-forest-800 hover:bg-forest-800 hover:text-cream-50">
            <DownloadIcon className="h-4 w-4" /> Confirmed only (CSV)
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-cream-200 bg-cream-50 p-6 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-forest-900">PDF export</h3>
        <p className="mt-2 text-xs leading-relaxed text-ink-600">
          A printable, landscape PDF of the register (last 1,000 records) for bank statements
          and annual reports.
        </p>
        <button
          type="button"
          onClick={() => void makePdf()}
          disabled={busyPdf}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-5 py-2.5 font-sans text-xs font-bold text-forest-950 hover:bg-gold-400 disabled:opacity-60"
        >
          <DownloadIcon className="h-4 w-4" />
          {busyPdf ? "Building PDF…" : "Download PDF"}
        </button>
        {msg ? <p className="mt-3 text-xs font-bold text-forest-800">{msg}</p> : null}
      </div>
    </div>
  );
}

/* ------------------------------ shell -------------------------------- */

export function AdminDashboard() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [admin, setAdmin] = useState<{ email: string; name: string } | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [tab, setTab] = useState("overview");
  const [tick, setTick] = useState(0);

  const onUnauth = useCallback(() => router.replace("/admin/login"), [router]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(async (r) => {
        if (!r.ok) throw new Error("unauthed");
        const d = (await r.json()) as { admin: { email: string; name: string }; expiresAt: string };
        setAdmin({ email: d.admin.email, name: d.admin.name });
        setExpiresAt(new Date(d.expiresAt));
        setAuthed(true);
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(iv);
  }, []);

  if (!authed) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm font-semibold text-ink-400">Checking session…</p>
      </div>
    );
  }

  const minsLeft = expiresAt ? Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / 60000)) : 0;
  void tick;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  const TABS = [
    ["overview", "Overview"],
    ["donations", "Donations"],
    ["campaigns", "Campaigns"],
    ["export", "Export"],
  ] as const;

  return (
    <div className="min-h-[70vh]">
      <div className="border-b border-cream-200 bg-forest-950">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-gold-300">
              IK Hope Centre · Administration
            </p>
            <p className="font-display text-lg font-semibold text-cream-50">{admin?.name}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-cream-100/70">
            <span className="hidden sm:inline">{admin?.email}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cream-100/20 px-3 py-1.5">
              <ClockIcon className="h-3.5 w-3.5 text-gold-300" />
              session ends in {minsLeft} min
            </span>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-full bg-cream-50/10 px-4 py-1.5 font-sans text-xs font-bold text-cream-50 transition hover:bg-cream-50/20"
            >
              Sign out
            </button>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
          {TABS.map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              aria-pressed={tab === k}
              className={`shrink-0 border-b-2 px-4 py-3 font-sans text-xs font-bold transition ${
                tab === k
                  ? "border-gold-400 text-gold-300"
                  : "border-transparent text-cream-100/60 hover:text-cream-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {tab === "overview" ? <OverviewPanel go={(t) => setTab(t)} /> : null}
        {tab === "donations" ? <DonationsPanel onUnauth={onUnauth} /> : null}
        {tab === "campaigns" ? <CampaignsPanel onUnauth={onUnauth} /> : null}
        {tab === "export" ? <ExportPanel /> : null}
      </div>
    </div>
  );
}
