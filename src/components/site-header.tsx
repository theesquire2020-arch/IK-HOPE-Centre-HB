"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CurrencySwitcher } from "@/components/currency";
import { HeartIcon, Logo, MenuIcon, XIcon } from "@/components/icons";
import { btn } from "@/components/ui";
import { t, type Lang } from "@/lib/i18n";

const NAV: { href: string; key: string }[] = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/programs", key: "programs" },
  { href: "/campaigns", key: "campaigns" },
  { href: "/contact", key: "contact" },
];

const LANG: Lang = "en"; // site ships English; Swahili dictionary is ready in lib/i18n

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-shadow ${
        scrolled ? "border-cream-200 bg-cream-50/95 shadow-sm backdrop-blur" : "border-transparent bg-cream-50"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="IK Hope Centre — home">
          <Logo className="h-9 w-9 shrink-0" />
          <span className="leading-tight">
            <span className="block font-display text-[17px] font-semibold text-forest-900">
              IK Hope Centre
            </span>
            <span className="block font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-gold-600">
              Orphanage · Kenya
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3.5 py-2 font-sans text-sm font-semibold transition ${
                  active
                    ? "bg-forest-100 text-forest-900"
                    : "text-ink-700 hover:bg-cream-100 hover:text-forest-900"
                }`}
              >
                {t(LANG, n.key)}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <CurrencySwitcher />
          <Link href="/fundraisers/new" className={btn.outline + " !px-4 !py-2 !text-xs"}>
            {t(LANG, "startFundraiser")}
          </Link>
          <Link href="/donate" className={btn.gold + " !px-5 !py-2.5 !text-xs"}>
            <HeartIcon className="h-4 w-4" />
            {t(LANG, "donate")}
          </Link>
        </div>

        <button
          type="button"
          className="rounded-full border border-cream-200 p-2 text-forest-900 md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <nav
          aria-label="Mobile"
          className="border-t border-cream-200 bg-cream-50 px-4 pb-5 pt-3 md:hidden"
        >
          <ul className="space-y-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className={`block rounded-xl px-4 py-2.5 font-sans text-base font-semibold ${
                    pathname === n.href
                      ? "bg-forest-100 text-forest-900"
                      : "text-ink-700 hover:bg-cream-100"
                  }`}
                >
                  {t(LANG, n.key)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between gap-3">
            <CurrencySwitcher />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link href="/fundraisers/new" className={btn.outline + " !justify-center !px-4 !py-2.5 !text-xs"}>
              {t(LANG, "startFundraiser")}
            </Link>
            <Link href="/donate" className={btn.gold + " !justify-center !px-4 !py-2.5 !text-xs"}>
              <HeartIcon className="h-4 w-4" />
              {t(LANG, "donate")}
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
