"use client";

import { useEffect, useState, useCallback } from "react";
import { CURRENCIES, type Currency } from "@/lib/rates";

/**
 * Tiny client-side currency store. The header switcher and every form
 * that displays money subscribe to it; the first visit auto-detects
 * the visitor's country via /api/geo and defaults Kenyan visitors to KES.
 */
const LS_KEY = "ikhc_currency";

let current: Currency = "KES";
const listeners = new Set<(c: Currency) => void>();

function emit() {
  listeners.forEach((l) => l(current));
}

export function getCurrency(): Currency {
  return current;
}

export function setCurrency(c: Currency) {
  current = c;
  try {
    localStorage.setItem(LS_KEY, c);
  } catch {
    /* private mode */
  }
  emit();
}

export function subscribeCurrency(fn: (c: Currency) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function useCurrency(): [Currency, (c: Currency) => void] {
  const [c, setC] = useState<Currency>(current);
  useEffect(() => {
    current = c;
    return subscribeCurrency(setC);
  }, [c]);
  return [c, setCurrency];
}

const COUNTRY_DEFAULT: Record<string, Currency> = {
  KE: "KES",
  US: "USD",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
  NL: "EUR",
  ES: "EUR",
  IT: "EUR",
  IE: "EUR",
  AT: "EUR",
};

/** Restore stored choice, otherwise auto-detect once. */
export function initCurrency() {
  if (typeof window === "undefined") return;
  if (listeners.size === 0) return; // nobody cares yet
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(LS_KEY);
  } catch {
    /* ignore */
  }
  if (stored && (CURRENCIES as readonly string[]).includes(stored)) {
    current = stored as Currency;
    return;
  }
  fetch("/api/geo")
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (d?.country) {
        current = COUNTRY_DEFAULT[d.country] ?? "KES";
        try {
          localStorage.setItem(LS_KEY, current);
        } catch {
          /* ignore */
        }
        emit();
      }
    })
    .catch(() => {});
}

export function CurrencySwitcher({ compact = false }: { compact?: boolean }) {
  const [c] = useCurrency();
  return (
    <div
      role="group"
      aria-label="Display currency"
      className={`inline-flex items-center rounded-full border border-cream-200 bg-cream-100 p-0.5 ${
        compact ? "" : ""
      }`}
    >
      {CURRENCIES.map((cur) => {
        const active = c === cur;
        return (
          <button
            key={cur}
            type="button"
            aria-pressed={active}
            onClick={() => setCurrency(cur)}
            className={`rounded-full px-2.5 py-1 font-sans text-[11px] font-bold tracking-wide transition sm:text-xs ${
              active
                ? "bg-forest-800 text-cream-50 shadow-sm"
                : "text-ink-600 hover:text-forest-800"
            }`}
          >
            {cur}
          </button>
        );
      })}
    </div>
  );
}

/** Call once (from layout) so auto-detection happens for subscribers. */
export function CurrencyBootstrap() {
  const [, force] = useState(0);
  const reInit = useCallback(() => initCurrency(), []);
  useEffect(() => {
    reInit();
  }, [reInit]);
  useEffect(() => subscribeCurrency(() => force((n) => n + 1)), []);
  return null;
}
