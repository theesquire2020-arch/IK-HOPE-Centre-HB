"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCurrency } from "@/components/currency";
import { btn } from "@/components/ui";
import {
  BankIcon,
  CardIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  DownloadIcon,
  HeartIcon,
  LockIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { CURRENCIES, type Currency } from "@/lib/rates";
import { fmtKES, fmtIn } from "@/lib/format";

type Method = "mpesa" | "airtel" | "bank" | "card";
type Stage = "form" | "push" | "receipt";

interface CampaignOption {
  slug: string;
  title: string;
  targetKes: number;
  raisedKes: number;
}

interface DonationResult {
  receiptCode: string;
  status: string;
  simulation: boolean;
  amountKes?: number;
  message?: string;
}

const PRESETS = [500, 1000, 2500, 5000];

const inputCls =
  "w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-400/70 focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-200";
const labelCls = "mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-ink-700";
const errCls = "mt-1.5 text-xs font-semibold text-clay-600";

export function DonateFlow({ initialCampaignSlug }: { initialCampaignSlug?: string }) {
  const [currency, setCurrency] = useCurrency();
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [campaignSlug, setCampaignSlug] = useState(initialCampaignSlug ?? "");

  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState<Method>("mpesa");
  const [transferRef, setTransferRef] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<Stage>("form");
  const [result, setResult] = useState<DonationResult | null>(null);
  const [liveStatus, setLiveStatus] = useState<string>("pending");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* live rates + campaign list */
  useEffect(() => {
    fetch("/api/rates").then((r) => r.json()).then((d) => setRates(d.rates ?? null)).catch(() => {});
    fetch("/api/campaigns").then((r) => r.json()).then((d: CampaignOption[]) => setCampaigns(d)).catch(() => {});
  }, []);

  const amountNum = Number.parseFloat(amount) || 0;
  const amountKesPreview = useMemo(() => {
    if (!amountNum || !rates) return null;
    return Math.round(amountNum * (rates[currency] ?? 1));
  }, [amountNum, currency, rates]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);
  useEffect(() => stopPolling, [stopPolling]);

  const startPolling = useCallback(
    (code: string) => {
      stopPolling();
      let tries = 0;
      pollRef.current = setInterval(async () => {
        tries += 1;
        try {
          const res = await fetch(`/api/donations/${code}/status`);
          if (res.ok) {
            const d = (await res.json()) as { status: string };
            setLiveStatus(d.status);
            if (d.status === "confirmed" || d.status === "failed") {
              stopPolling();
              setStage("receipt");
            }
          }
        } catch {
          /* keep polling */
        }
        if (tries > 40) {
          stopPolling();
        }
      }, 2500);
    },
    [stopPolling],
  );

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!amountNum || amountNum < 1) e.amount = "Enter a valid amount.";
    else if (!rates && currency !== "KES") {
      /* rates still loading; server re-validates */
    } else if (amountNum * (rates?.[currency] ?? 1) < 10) {
      e.amount = "The minimum donation is KES 10.";
    }
    if (donorName.trim().length < 2) e.donorName = "Please enter your full name.";
    if (donorEmail.trim() && !/^\S+@\S+\.\S+$/.test(donorEmail.trim()))
      e.donorEmail = "Enter a valid email for your e-receipt (or leave blank).";
    if ((method === "mpesa" || method === "airtel") && !/^(\+?254|0)?(7|1)\d{8}$/.test(donorPhone.replace(/\s/g, "")))
      e.donorPhone = "Enter the Kenyan phone number that will get the payment prompt.";
    if (method === "bank") {
      if (transferRef.trim().length < 4) e.transferRef = "Enter the transfer reference from your bank.";
      if (!proofFile) e.proof = "Upload proof of transfer (screenshot or PDF).";
      else if (proofFile.size > 5 * 1024 * 1024) e.proof = "File must be under 5 MB.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});
    try {
      let res: Response;
      if (method === "bank" && proofFile) {
        const fd = new FormData();
        fd.set("method", method);
        fd.set("amount", String(amountNum));
        fd.set("currency", currency);
        fd.set("campaignSlug", campaignSlug);
        fd.set("donorName", donorName);
        fd.set("donorEmail", donorEmail);
        fd.set("donorPhone", donorPhone);
        fd.set("message", message);
        fd.set("transferRef", transferRef);
        fd.append("proof", proofFile);
        res = await fetch("/api/donations", { method: "POST", body: fd });
      } else {
        res = await fetch("/api/donations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method,
            amount: amountNum,
            currency,
            campaignSlug,
            donorName,
            donorEmail,
            donorPhone,
            message,
          }),
        });
      }
      const data = (await res.json()) as DonationResult & { error?: string };
      if (!res.ok) {
        setErrors({ form: data.error || "Something went wrong. Please try again." });
        return;
      }
      setResult(data);
      if (data.status === "bank_pending") {
        setLiveStatus("bank_pending");
        setStage("receipt");
      } else {
        setStage("push");
        startPolling(data.receiptCode);
      }
    } catch {
      setErrors({ form: "Network error — please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    stopPolling();
    setStage("form");
    setResult(null);
    setLiveStatus("pending");
    setAmount("");
    setTransferRef("");
    setProofFile(null);
    setMessage("");
  }

  function downloadReceipt() {
    if (!result) return;
    const lines = [
      "IK HOPE CENTRE ORPHANAGE — DONATION RECEIPT",
      "Reg. No. 000-NGC-2358 (NGCB) · Nairobi, Kenya",
      "--------------------------------------------",
      `Receipt No. : ${result.receiptCode}`,
      `Date        : ${new Date().toLocaleString("en-KE")}`,
      `Donor       : ${donorName}`,
      `Amount      : ${amount} ${currency} (≈ ${fmtKES(result.amountKes ?? amountKesPreview ?? 0)})`,
      `Method      : ${method.toUpperCase()}`,
      `Status      : ${liveStatus}`,
      "",
      "Thank you for giving a child in our care a future.",
      "This is a computer-generated receipt.",
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${result.receiptCode}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const waShare = result
    ? `https://wa.me/?text=${encodeURIComponent(
        `I just gave ${amount} ${currency} to IK Hope Centre to support the children in their care. Join me: ${window.location.origin}/donate`,
      )}`
    : "#";

  const selectedCampaign = campaigns.find((c) => c.slug === campaignSlug);

  /* ============================ STAGE: PUSH ============================ */
  if (stage === "push" && result) {
    const done = liveStatus === "confirmed";
    const failed = liveStatus === "failed";
    return (
      <div className="rounded-3xl border border-cream-200 bg-cream-50 p-8 shadow-sm sm:p-10">
        <div className="mx-auto max-w-md text-center">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
              failed ? "bg-clay-500/15 text-clay-600" : "bg-forest-100 text-forest-700"
            }`}
          >
            {failed ? (
              <span className="font-sans text-2xl font-bold">!</span>
            ) : done ? (
              <CheckIcon className="h-8 w-8" />
            ) : (
              <PhoneIcon className="h-7 w-7 animate-pulse" />
            )}
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold text-forest-900">
            {failed
              ? "Payment was declined"
              : done
                ? "Payment confirmed"
                : `Check your phone${method === "card" ? " / card page" : ""}`}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">
            {failed
              ? "The provider declined or the prompt expired. Nothing was charged — you can retry below."
              : done
                ? "The provider confirmed your gift on our server. Your receipt is ready below."
                : result.simulation
                  ? "Test mode: the provider callback will confirm your gift in a few seconds. In live mode, approve the STK push / Airtel prompt with your PIN."
                  : `A payment prompt for ${fmtKES(result.amountKes ?? 0)} is on the way. Approve it with your ${
                      method === "airtel" ? "Airtel Money PIN" : "M-PESA PIN"
                    }. This page updates automatically.`}
          </p>

          {!done && !failed ? (
            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-ink-400">
              <span className="h-2 w-2 animate-ping rounded-full bg-forest-600" />
              Waiting for provider callback…
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setStage("receipt")}
              className={`${btn.gold} mt-6 w-full`}
            >
              View receipt
            </button>
          )}
          {(failed || (liveStatus === "pending" && !result.simulation)) && !done ? (
            <button type="button" onClick={reset} className={`${btn.ghost} mt-3 w-full`}>
              Try again
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  /* =========================== STAGE: RECEIPT ========================== */
  if (stage === "receipt" && result) {
    const confirmed = liveStatus === "confirmed";
    const bankPending = liveStatus === "bank_pending";
    const failed = liveStatus === "failed";
    return (
      <div className="overflow-hidden rounded-3xl border border-cream-200 bg-cream-50 shadow-sm">
        <div className={`px-8 py-6 text-center ${confirmed ? "bg-forest-800" : bankPending ? "bg-gold-500" : "bg-clay-600"}`}>
          <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${confirmed ? "bg-forest-700 text-gold-300" : bankPending ? "bg-gold-400 text-forest-950" : "bg-clay-500 text-cream-50"}`}>
            {confirmed ? <CheckIcon className="h-7 w-7" /> : bankPending ? <ClockIcon className="h-7 w-7" /> : <span className="text-xl font-bold">!</span>}
          </div>
          <h2 className="mt-3 font-display text-2xl font-semibold text-cream-50">
            {confirmed
              ? "Asante sana — your gift is confirmed"
              : bankPending
                ? "Transfer received — verifying"
                : "Payment could not be completed"}
          </h2>
          {selectedCampaign ? (
            <p className="mt-1 text-xs font-semibold text-cream-100/80">
              for {selectedCampaign.title}
            </p>
          ) : null}
        </div>

        <div className="p-8 sm:p-10">
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {[
              ["Receipt No.", result.receiptCode],
              ["Donor", donorName],
              ["Amount", `${amount} ${currency}`],
              ["Amount in KES", fmtKES(result.amountKes ?? amountKesPreview ?? 0)],
              ["Method", method === "mpesa" ? "M-PESA" : method === "airtel" ? "Airtel Money" : method === "bank" ? "Bank transfer" : "Card"],
              ["Status", confirmed ? "Confirmed" : bankPending ? "Awaiting bank verification (≤ 24h)" : "Declined"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-b border-cream-200 pb-2.5">
                <dt className="font-sans text-xs font-bold uppercase tracking-wider text-ink-400">{k}</dt>
                <dd className="text-right font-sans text-sm font-bold text-forest-900">{v}</dd>
              </div>
            ))}
          </dl>

          {bankPending ? (
            <p className="mt-5 rounded-xl bg-gold-100 p-4 text-xs leading-relaxed text-ink-700">
              Our finance team checks bank transfers line-by-line (usually within a few hours,
              always within 24). Once verified, the gift counts toward the goal and your final
              receipt is emailed.
            </p>
          ) : null}

          <p className="mt-5 text-xs leading-relaxed text-ink-400">
            A copy of this receipt {donorEmail ? "has been emailed to you" : "is ready below"}.
            Your donor details are visible to our team only — public pages show aggregate
            totals, never individual gifts.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <button type="button" onClick={downloadReceipt} className={btn.forest + " !text-xs"}>
              <DownloadIcon className="h-4 w-4" /> Download receipt
            </button>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(result.receiptCode);
              }}
              className={btn.outline + " !text-xs"}
            >
              <CopyIcon className="h-4 w-4" /> Copy receipt code
            </button>
            <a href={waShare} target="_blank" rel="noreferrer" className={btn.outline + " !text-xs"}>
              <WhatsAppIcon className="h-4 w-4" /> Share on WhatsApp
            </a>
            <button type="button" onClick={reset} className={btn.ghost + " !text-xs"}>
              Give again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ============================ STAGE: FORM ============================ */
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="rounded-3xl border border-cream-200 bg-cream-50 p-6 shadow-sm sm:p-8"
    >
      {errors.form ? (
        <p role="alert" className="mb-5 rounded-xl bg-clay-500/10 p-3.5 text-sm font-semibold text-clay-600">
          {errors.form}
        </p>
      ) : null}

      {/* amount + currency */}
      <fieldset>
        <legend className={labelCls}>1 · Your gift</legend>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-sans text-sm font-bold text-ink-400">
              {currency === "KES" ? "KES" : currency}
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="2500"
              aria-label={`Amount in ${currency}`}
              className={inputCls + " !pl-14 text-lg font-bold"}
            />
          </div>
          <div className="flex rounded-xl border border-cream-300 p-1" role="group" aria-label="Currency">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={currency === c}
                onClick={() => setCurrency(c as Currency)}
                className={`rounded-lg px-3 py-2 font-sans text-xs font-bold transition ${
                  currency === c ? "bg-forest-800 text-cream-50" : "text-ink-600 hover:text-forest-800"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(String(p))}
              className="rounded-full border border-cream-300 bg-cream-100 px-3.5 py-1.5 font-sans text-xs font-bold text-ink-700 transition hover:border-forest-600 hover:text-forest-800"
            >
              {fmtKES(p)}
            </button>
          ))}
          <span className="text-xs font-semibold text-ink-400">
            {amountNum > 0 && rates
              ? `≈ ${currency === "KES" ? fmtKES(amountNum) : fmtIn(currency, Math.round(amountNum * (rates[currency] ?? 1)), rates)} · 1 ${currency} = ${(rates[currency] ?? 1).toFixed(2)} KES`
              : "Minimum KES 10"}
          </span>
        </div>
        {errors.amount ? <p className={errCls}>{errors.amount}</p> : null}
      </fieldset>

      {/* campaign */}
      <div className="mt-6">
        <label htmlFor="campaign" className={labelCls}>
          Where should it go?
        </label>
        <select
          id="campaign"
          value={campaignSlug}
          onChange={(e) => setCampaignSlug(e.target.value)}
          className={inputCls}
        >
          <option value="">General fund — where it's needed most</option>
          {campaigns.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.title} ({Math.round((c.raisedKes / c.targetKes) * 100)}% funded)
            </option>
          ))}
        </select>
      </div>

      {/* donor details */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="donorName" className={labelCls}>Full name *</label>
          <input id="donorName" value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="Amina Hassan" className={inputCls} autoComplete="name" />
          {errors.donorName ? <p className={errCls}>{errors.donorName}</p> : null}
        </div>
        <div>
          <label htmlFor="donorEmail" className={labelCls}>Email (for e-receipt)</label>
          <input id="donorEmail" type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} placeholder="you@example.com" className={inputCls} autoComplete="email" />
          {errors.donorEmail ? <p className={errCls}>{errors.donorEmail}</p> : null}
        </div>
        <div>
          <label htmlFor="donorPhone" className={labelCls}>
            {method === "mpesa" || method === "airtel" ? "Phone for payment prompt *" : "Phone (optional)"}
          </label>
          <input id="donorPhone" inputMode="tel" value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} placeholder="0712 345 678" className={inputCls} autoComplete="tel" />
          {errors.donorPhone ? <p className={errCls}>{errors.donorPhone}</p> : null}
        </div>
        <div>
          <label htmlFor="msg" className={labelCls}>Message of hope (optional)</label>
          <input id="msg" value={message} maxLength={280} onChange={(e) => setMessage(e.target.value)} placeholder="For the children 🌱" className={inputCls} />
        </div>
      </div>

      {/* method */}
      <fieldset className="mt-7">
        <legend className={labelCls}>2 · How you'd like to pay</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Payment method">
          {(
            [
              ["mpesa", "M-PESA", <PhoneIcon key="i" className="h-4.5 w-4.5" />],
              ["airtel", "Airtel Money", <PhoneIcon key="i" className="h-4.5 w-4.5" />],
              ["bank", "Bank transfer", <BankIcon key="i" className="h-4.5 w-4.5" />],
              ["card", "Card", <CardIcon key="i" className="h-4.5 w-4.5" />],
            ] as [Method, string, React.ReactNode][]
          ).map(([m, label, icon]) => (
            <button
              key={m}
              type="button"
              aria-pressed={method === m}
              onClick={() => setMethod(m)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3.5 font-sans text-xs font-bold transition ${
                method === m
                  ? "border-forest-800 bg-forest-50 text-forest-900"
                  : "border-cream-300 bg-cream-50 text-ink-600 hover:border-forest-300"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {(method === "mpesa" || method === "airtel") ? (
            <div className="rounded-xl border border-cream-200 bg-cream-100/60 p-4 text-xs leading-relaxed text-ink-700">
              You'll get a {method === "mpesa" ? "M-PESA STK push" : "Airtel Money prompt"} on{" "}
              <strong>{donorPhone || "the phone number above"}</strong>. Approve it with your PIN —
              we confirm the payment server-side the moment Safaricom/Airtel reports it.
            </div>
          ) : null}

          {method === "bank" ? (
            <div className="space-y-4 rounded-xl border border-cream-200 bg-cream-100/60 p-4">
              <div className="grid gap-2 text-xs sm:grid-cols-2">
                <div className="rounded-lg bg-cream-50 p-3">
                  <p className="font-bold text-forest-900">Bank transfer (KES)</p>
                  <p className="mt-1 text-ink-600">KCB Bank · IK HOPE CENTRE ORPHANAGE<br />A/C 1012345678 · Branch: Kasarani</p>
                </div>
                <div className="rounded-lg bg-cream-50 p-3">
                  <p className="font-bold text-forest-900">Or M-PESA Paybill</p>
                  <p className="mt-1 text-ink-600">Paybill 522100 · Account: your full name<br />then upload the screenshot below</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="trf" className={labelCls}>Bank reference / Txn ID *</label>
                  <input id="trf" value={transferRef} onChange={(e) => setTransferRef(e.target.value)} placeholder="e.g. TRF-88231" className={inputCls} />
                  {errors.transferRef ? <p className={errCls}>{errors.transferRef}</p> : null}
                </div>
                <div>
                  <label htmlFor="proof" className={labelCls}>Proof of transfer *</label>
                  <input
                    id="proof"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                    className="block w-full font-sans text-xs text-ink-600 file:mr-3 file:rounded-full file:border-0 file:bg-forest-800 file:px-4 file:py-2 file:font-sans file:text-xs file:font-bold file:text-cream-50 hover:file:bg-forest-700"
                  />
                  {errors.proof ? <p className={errCls}>{errors.proof}</p> : null}
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-ink-400">
                Transfers are verified by our finance team (usually same day, always within 24h)
                and only count toward campaign totals after verification.
              </p>
            </div>
          ) : null}

          {method === "card" ? (
            <div className="rounded-xl border border-cream-200 bg-cream-100/60 p-4 text-xs leading-relaxed text-ink-700">
              International cards are processed by our PCI-DSS partner (Flutterwave) as a
              fallback for donors outside Kenya. In this demo environment the charge is
              simulated through the same server-side confirmation path.
            </div>
          ) : null}
        </div>
      </fieldset>

      <button type="submit" disabled={submitting} className={`${btn.gold} mt-7 w-full !py-4 !text-base disabled:cursor-wait disabled:opacity-70`}>
        <HeartIcon className="h-5 w-5" />
        {submitting
          ? "Starting payment…"
          : method === "bank"
            ? "Record my bank transfer"
            : `Give ${amountNum > 0 ? `${amountNum.toLocaleString()} ${currency}` : "now"}`}
      </button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] font-semibold text-ink-400">
        <LockIcon className="h-3.5 w-3.5 text-forest-600" />
        Payments verified server-side by the provider · 256-bit TLS · your details are never published
      </p>
    </form>
  );
}
