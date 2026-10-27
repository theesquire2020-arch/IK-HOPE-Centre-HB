import Link from "next/link";
import { pct } from "@/lib/format";

/* Shared button classes (kept as strings for server + client use) */
export const btn = {
  gold: "inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-3 font-sans text-sm font-bold text-forest-950 shadow-sm transition hover:bg-gold-400 active:translate-y-px",
  forest:
    "inline-flex items-center justify-center gap-2 rounded-full bg-forest-800 px-6 py-3 font-sans text-sm font-bold text-cream-50 shadow-sm transition hover:bg-forest-700 active:translate-y-px",
  outline:
    "inline-flex items-center justify-center gap-2 rounded-full border-2 border-forest-800 px-6 py-3 font-sans text-sm font-bold text-forest-800 transition hover:bg-forest-800 hover:text-cream-50 active:translate-y-px",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-forest-800 transition hover:bg-forest-100",
  sm: "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition active:translate-y-px",
};

export function SectionHeading({
  kicker,
  title,
  lede,
  align = "left",
  dark = false,
}: {
  kicker: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
  dark?: boolean;
}) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <p
        className={`font-sans text-xs font-bold uppercase tracking-[0.18em] ${
          dark ? "text-gold-300" : "text-gold-600"
        }`}
      >
        {kicker}
      </p>
      <h2
        className={`mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl ${
          dark ? "text-cream-50" : "text-forest-900"
        }`}
      >
        {title}
      </h2>
      {lede ? (
        <p className={`mt-4 text-base leading-relaxed ${dark ? "text-cream-100/85" : "text-ink-600"}`}>
          {lede}
        </p>
      ) : null}
    </div>
  );
}

export function ProgressBar({
  raised,
  target,
  className = "",
  label,
}: {
  raised: number;
  target: number;
  className?: string;
  label?: string;
}) {
  const p = pct(raised, target);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={p}
      aria-label={label || `${p}% funded`}
      className={`h-2.5 w-full overflow-hidden rounded-full bg-cream-200 ${className}`}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400"
        style={{ width: `${Math.max(p, raised > 0 ? 2 : 0)}%` }}
      />
    </div>
  );
}

export function Stat({
  value,
  label,
  dark = false,
}: {
  value: string;
  label: string;
  dark?: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className={`font-display text-4xl font-semibold sm:text-5xl ${
          dark ? "text-gold-300" : "text-forest-800"
        }`}
      >
        {value}
      </div>
      <div
        className={`mt-2 font-sans text-xs font-semibold uppercase tracking-wider ${
          dark ? "text-cream-100/80" : "text-ink-600"
        }`}
      >
        {label}
      </div>
    </div>
  );
}

export function LinkButton({
  href,
  variant = "gold",
  children,
  className = "",
}: {
  href: string;
  variant?: "gold" | "forest" | "outline";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${btn[variant]} ${className}`}>
      {children}
    </Link>
  );
}
