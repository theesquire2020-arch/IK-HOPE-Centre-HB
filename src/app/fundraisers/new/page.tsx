import type { Metadata } from "next";
import { FundraiserForm } from "@/components/fundraiser-form";

export const metadata: Metadata = {
  title: "Start a Fundraiser",
  description:
    "Launch a fundraising campaign for the children of IK Hope Centre. We review every campaign within 24 hours and give you a public page with a progress bar and share links.",
};

export default function NewFundraiserPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="max-w-2xl">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
          Fundraise with us
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest-900 sm:text-4xl">
          Start a fundraiser for the children
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
          Birthdays, anniversaries, team challenges, graduations — turn your occasion into a
          public campaign page with a progress bar. We approve or reject within 24 hours and
          email you the shareable link.
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {[
          ["1. Tell us about it", "Your name, email, a title, a story and a goal in any supported currency."],
          ["2. We review (≤ 24h)", "Every campaign is screened for safety and policy. Child identities stay private."],
          ["3. Share your link", "Your live page appears under /campaigns — with a progress bar, WhatsApp sharing and direct donations."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-2xl border border-cream-200 bg-cream-100/60 p-5 text-sm">
            <p className="font-sans font-bold text-forest-900">{t}</p>
            <p className="mt-1.5 leading-relaxed text-ink-600">{d}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <FundraiserForm />
      </div>
    </div>
  );
}
