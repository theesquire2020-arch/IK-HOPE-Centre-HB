"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, WhatsAppIcon } from "@/components/icons";

export function ShareButton({ url, text }: { url: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const wa = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard?.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          });
        }}
        className="inline-flex items-center gap-1.5 rounded-full border-2 border-forest-800 px-4 py-2 font-sans text-xs font-bold text-forest-800 transition hover:bg-forest-800 hover:text-cream-50"
      >
        {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
        {copied ? "Link copied" : "Copy link"}
      </button>
      <a
        href={wa}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-forest-800 px-4 py-2 font-sans text-xs font-bold text-cream-50 transition hover:bg-forest-700"
      >
        <WhatsAppIcon className="h-4 w-4" />
        Share on WhatsApp
      </a>
    </div>
  );
}
