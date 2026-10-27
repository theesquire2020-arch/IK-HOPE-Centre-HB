/**
 * Live FX rates (base: KES) with in-memory caching + safe fallbacks.
 * Primary source: exchangerate.host (uses EXCHANGE_RATE_API_KEY when set),
 * free fallback: open.er-api.com. Rates are cached for 5 minutes.
 * All stored amounts are KES; `rateUsed` = KES per 1 unit of original currency.
 */
export type Currency = "KES" | "USD" | "EUR" | "GBP";
export const CURRENCIES: readonly Currency[] = ["KES", "USD", "EUR", "GBP"];

const FALLBACK_KES_PER: Record<Currency, number> = {
  KES: 1,
  USD: 129.4,
  EUR: 146.2,
  GBP: 169.8,
};

const TTL_MS = 5 * 60 * 1000;

let cache: { at: number; rates: Record<Currency, number>; source: string } = {
  at: 0,
  rates: { ...FALLBACK_KES_PER },
  source: "fallback",
};

/** Normalize an API value to "KES per 1 unit" regardless of API convention. */
function toKesPerUnit(perOneKes: number, fallback: number): number {
  if (!Number.isFinite(perOneKes) || perOneKes <= 0) return fallback;
  return perOneKes >= 1 ? perOneKes : 1 / perOneKes;
}

export async function getRates(): Promise<Record<Currency, number>> {
  if (Date.now() - cache.at < TTL_MS) return cache.rates;
  try {
    const key = process.env.EXCHANGE_RATE_API_KEY;
    const url = key
      ? `https://api.exchangerate.host/latest?base=KES&access_key=${encodeURIComponent(key)}&symbols=USD,EUR,GBP`
      : "https://open.er-api.com/v6/latest/KES";
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`rates http ${res.status}`);
    const data = (await res.json()) as { rates?: Record<string, number> };
    if (!data.rates) throw new Error("bad payload");
    const rates: Record<Currency, number> = {
      KES: 1,
      USD: toKesPerUnit(Number(data.rates.USD), FALLBACK_KES_PER.USD),
      EUR: toKesPerUnit(Number(data.rates.EUR), FALLBACK_KES_PER.EUR),
      GBP: toKesPerUnit(Number(data.rates.GBP), FALLBACK_KES_PER.GBP),
    };
    cache = { at: Date.now(), rates, source: key ? "exchangerate.host" : "open.er-api.com" };
  } catch (e) {
    console.warn("[rates] fetch failed, using fallback:", (e as Error).message);
    cache = { at: Date.now(), rates: { ...FALLBACK_KES_PER }, source: "fallback" };
  }
  return cache.rates;
}

export function getRatesSource() {
  return cache.source;
}

export function convertToKes(
  amount: number,
  currency: Currency,
  rates: Record<Currency, number>,
): number {
  if (currency === "KES") return Math.round(amount);
  return Math.round(amount * (rates[currency] ?? FALLBACK_KES_PER[currency]));
}

export function isCurrency(v: unknown): v is Currency {
  return typeof v === "string" && (CURRENCIES as readonly string[]).includes(v);
}
