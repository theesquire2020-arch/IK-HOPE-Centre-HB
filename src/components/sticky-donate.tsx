"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartIcon } from "@/components/icons";

/** Mobile-first sticky donate bar — hidden on the donate page & admin. */
export function StickyDonate() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hidden = pathname.startsWith("/donate") || pathname.startsWith("/admin");

  if (hidden) return null;

  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-cream-200 bg-cream-50/95 px-4 pb-[max(env(safe-area-inset-bottom),10px)] pt-3 shadow-[0_-8px_24px_-12px_rgba(8,40,26,0.25)] backdrop-blur transition-transform duration-300 lg:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <p className="min-w-0 text-xs font-semibold leading-snug text-ink-700">
          <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-gold-600">
            M-PESA · Airtel Money · Bank
          </span>
          <span className="truncate">
            Give a child a meal, a classroom, a check-up.
          </span>
        </p>
        <Link
          href="/donate"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gold-500 px-5 py-3 font-sans text-sm font-bold text-forest-950 shadow-sm transition hover:bg-gold-400 active:translate-y-px"
        >
          <HeartIcon className="h-4 w-4" />
          Donate now
        </Link>
      </div>
    </div>
  );
}
