"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btn } from "@/components/ui";

const inputCls =
  "w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-400/70 focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-200";

export function AdminLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"password" | "totp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      setStep("totp");
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; redirect?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "Verification failed.");
        return;
      }
      router.push(data.redirect || "/admin");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  if (step === "totp") {
    return (
      <form onSubmit={submitCode} className="rounded-3xl border border-cream-200 bg-cream-50 p-6 shadow-sm">
        <p className="font-sans text-xs font-bold uppercase tracking-wider text-gold-600">
          Step 2 of 2
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold text-forest-900">
          Authenticator code
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-ink-600">
          Enter the 6-digit code from your authenticator app (or your one-time recovery code).
        </p>
        {error ? (
          <p role="alert" className="mt-4 rounded-xl bg-clay-500/10 p-3 text-xs font-semibold text-clay-600">
            {error}
          </p>
        ) : null}
        <input
          autoFocus
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="••••••"
          aria-label="Authenticator code"
          className={inputCls + " mt-4 !text-center !text-2xl !font-bold tracking-[0.5em]"}
        />
        <button type="submit" disabled={busy || code.length < 6} className={`${btn.forest} mt-4 w-full disabled:opacity-60`}>
          {busy ? "Verifying…" : "Verify & sign in"}
        </button>
        <button
          type="button"
          onClick={() => {
            setStep("password");
            setCode("");
            setError("");
          }}
          className="mt-3 w-full text-center text-xs font-semibold text-ink-400 hover:text-forest-800"
        >
          Back to password
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={submitPassword} className="rounded-3xl border border-cream-200 bg-cream-50 p-6 shadow-sm">
      <p className="font-sans text-xs font-bold uppercase tracking-wider text-gold-600">
        Step 1 of 2
      </p>
      <h2 className="mt-1 font-display text-xl font-semibold text-forest-900">
        Email & password
      </h2>
      {error ? (
        <p role="alert" className="mt-4 rounded-xl bg-clay-500/10 p-3 text-xs font-semibold text-clay-600">
          {error}
        </p>
      ) : null}
      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="a-email" className="mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-ink-700">
            Email
          </label>
          <input
            id="a-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@ikhope.org"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="a-pass" className="mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-ink-700">
            Password
          </label>
          <input
            id="a-pass"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
            className={inputCls}
          />
        </div>
      </div>
      <button type="submit" disabled={busy || !email || !password} className={`${btn.gold} mt-5 w-full disabled:opacity-60`}>
        {busy ? "Checking…" : "Continue"}
      </button>
      <p className="mt-4 text-center text-[11px] leading-relaxed text-ink-400">
        Protected area. Login attempts are rate-limited and logged.
      </p>
    </form>
  );
}
