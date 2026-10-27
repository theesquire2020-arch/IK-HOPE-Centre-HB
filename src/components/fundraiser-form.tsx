"use client";

import { useState } from "react";
import { useCurrency } from "@/components/currency";
import { btn } from "@/components/ui";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { CURRENCIES, type Currency } from "@/lib/rates";

const inputCls =
  "w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-400/70 focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-200";
const labelCls = "mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-ink-700";

export function FundraiserForm() {
  const [currency, setCurrency] = useCurrency();
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [policy, setPolicy] = useState(false);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ slug: string; message: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!policy) {
      setError("Please confirm the policy statement before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName,
          ownerEmail,
          ownerPhone,
          title,
          description,
          target: Number(target) || 0,
          currency,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; slug?: string; message?: string; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong — please try again.");
        return;
      }
      setDone({ slug: data.slug!, message: data.message! });
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-forest-200 bg-forest-50 p-8 text-center sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest-800 text-gold-300">
          <CheckIcon className="h-7 w-7" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-semibold text-forest-900">
          Submitted — karibu, {ownerName.split(" ")[0]}!
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-700">{done.message}</p>
        <div className="mx-auto mt-5 max-w-sm rounded-xl bg-cream-50 p-4 text-left">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-ink-400">
            Your page (goes live on approval)
          </p>
          <p className="mt-1 break-all font-sans text-sm font-bold text-forest-800">
            /campaigns/{done.slug}
          </p>
        </div>
        <p className="mt-5 text-xs text-ink-400">
          We email {ownerEmail} when it's live — usually within a few hours.
        </p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={submit}
      className="rounded-3xl border border-cream-200 bg-cream-50 p-6 shadow-sm sm:p-8"
    >
      {error ? (
        <p role="alert" className="mb-5 rounded-xl bg-clay-500/10 p-3.5 text-sm font-semibold text-clay-600">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="f-name" className={labelCls}>Your full name *</label>
          <input id="f-name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inputCls} autoComplete="name" placeholder="Amina Hassan" />
        </div>
        <div>
          <label htmlFor="f-email" className={labelCls}>Email *</label>
          <input id="f-email" type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} className={inputCls} autoComplete="email" placeholder="you@example.com" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="f-phone" className={labelCls}>Phone (optional, for updates)</label>
          <input id="f-phone" inputMode="tel" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} className={inputCls} placeholder="0712 345 678" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="f-title" className={labelCls}>Campaign title *</label>
          <input id="f-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} className={inputCls} placeholder="Amina's 21st: school kits for a term" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="f-desc" className={labelCls}>Why this campaign? * <span className="font-normal normal-case text-ink-400">(min 40 characters)</span></label>
          <textarea
            id="f-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1200}
            rows={5}
            className={inputCls + " resize-y"}
            placeholder="Tell people what this raises for and why it matters to you…"
          />
          <p className="mt-1 text-right text-[11px] text-ink-400">{description.length}/1200</p>
        </div>
        <div>
          <label htmlFor="f-target" className={labelCls}>Goal amount *</label>
          <input id="f-target" type="number" min={1} step="0.01" value={target} onChange={(e) => setTarget(e.target.value)} className={inputCls} placeholder="25000" />
        </div>
        <div>
          <label htmlFor="f-cur" className={labelCls}>Currency</label>
          <select id="f-cur" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className={inputCls}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <label className="mt-5 flex items-start gap-3 rounded-xl border border-cream-200 bg-cream-100/60 p-4 text-xs leading-relaxed text-ink-700">
        <input
          type="checkbox"
          checked={policy}
          onChange={(e) => setPolicy(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-forest-800"
        />
        <span>
          I confirm this campaign is for a charitable purpose, contains no photos or names of
          children in the centre's care, and follows our acceptable-use policy.
        </span>
      </label>

      <button type="submit" disabled={submitting} className={`${btn.gold} mt-6 w-full !py-4 disabled:cursor-wait disabled:opacity-70`}>
        Submit for review <ArrowRightIcon className="h-4.5 w-4.5" />
      </button>
      <p className="mt-3 text-center text-[11px] font-semibold text-ink-400">
        Reviewed by a human within 24 hours · min goal KES 1,000
      </p>
    </form>
  );
}
