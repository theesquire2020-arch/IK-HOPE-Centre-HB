"use client";

import { useState } from "react";
import { btn } from "@/components/ui";
import { CheckIcon, MailIcon } from "@/components/icons";

const inputCls =
  "w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-400/70 focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-200";
const labelCls = "mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-ink-700";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; message?: string };
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setOk(true);
    } catch {
      setError("Network error — please email us directly instead.");
    } finally {
      setBusy(false);
    }
  }

  if (ok) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-forest-200 bg-forest-50 p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-800 text-gold-300">
          <CheckIcon className="h-7 w-7" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-semibold text-forest-900">
          Asante — message received
        </h2>
        <p className="mt-2 max-w-sm text-sm text-ink-700">
          We reply within two business days to {email || "your inbox"}.
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
          <label htmlFor="c-name" className={labelCls}>Name *</label>
          <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="c-email" className={labelCls}>Email *</label>
          <input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoComplete="email" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="c-subject" className={labelCls}>Subject</label>
          <input id="c-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} placeholder="Donor question, partnership, press…" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="c-msg" className={labelCls}>Message *</label>
          <textarea id="c-msg" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className={inputCls + " resize-y"} />
        </div>
      </div>
      <button type="submit" disabled={busy} className={`${btn.gold} mt-6 w-full !py-3.5 disabled:opacity-70`}>
        <MailIcon className="h-4.5 w-4.5" />
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
