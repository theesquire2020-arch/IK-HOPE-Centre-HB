/** Money + date formatting (works on server and client). */

export function fmtKES(kes: number): string {
  return `KES ${Math.round(kes).toLocaleString("en-KE")}`;
}

/** Format a KES amount expressed in another currency using KES-per-unit rates. */
export function fmtIn(
  currency: string,
  kes: number,
  rates?: Record<string, number>,
): string {
  if (!rates || !rates[currency]) {
    if (currency === "KES") return fmtKES(kes);
    return `${(kes / 129.4).toFixed(2)} ${currency}`;
  }
  const v = kes / rates[currency];
  const dp = currency === "KES" ? 0 : 2;
  return `${v.toLocaleString(undefined, {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  })} ${currency}`;
}

export function pct(raised: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((raised / target) * 100));
}

export function fmtDate(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
