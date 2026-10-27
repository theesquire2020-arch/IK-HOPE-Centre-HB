import type { Metadata } from "next";
import Link from "next/link";
import { DonateFlow } from "@/components/donate-flow";
import { CheckIcon, ShieldIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Donate to IK Hope Centre Orphanage by M-PESA STK Push, Airtel Money, bank transfer or card. Instant receipts, server-verified payments, in KES, USD, EUR or GBP.",
};

export const dynamic = "force-dynamic";

export default async function DonatePage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  const { campaign } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="max-w-2xl">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
          Give today
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest-900 sm:text-4xl">
          Donate to the children in our care
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
          Every payment is verified on our servers by the provider itself — never in your
          browser — and you receive an instant receipt code and emailed e-receipt.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <DonateFlow initialCampaignSlug={campaign} />

        <aside className="space-y-5">
          <div className="rounded-2xl border border-cream-200 bg-cream-100/70 p-6">
            <h2 className="font-display text-lg font-semibold text-forest-900">
              What your gift does
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-700">
              {[
                ["KES 250", "a full school day for one child"],
                ["KES 2,500", "a week of meals for one child"],
                ["KES 8,000", "one child's clinic visit + medicines"],
                ["KES 12,000", "a term's fees & learning kit"],
              ].map(([v, d]) => (
                <li key={v} className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex min-w-16 justify-center rounded-full bg-forest-800 px-2 py-0.5 font-sans text-[11px] font-bold text-gold-300">
                    {v}
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-forest-200 bg-forest-50 p-6">
            <div className="flex items-center gap-2.5">
              <ShieldIcon className="h-5 w-5 text-forest-800" />
              <h2 className="font-display text-base font-semibold text-forest-900">
                Safe by design
              </h2>
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink-700">
              {[
                "Payments confirmed only via provider callbacks on our servers",
                "Your name and amount are never published anywhere",
                "Bank transfers are verified line-by-line before counting",
                "Registered in Kenya: NGCB 000-NGC-2358",
              ].map((li) => (
                <li key={li} className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-600" />
                  {li}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-cream-200 bg-cream-50 p-6 text-sm">
            <h2 className="font-display text-base font-semibold text-forest-900">
              Prefer to fund a specific goal?
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-ink-600">
              Browse live campaigns with their progress bars, then pick one in the form — or
              start your own fundraiser for a birthday or anniversary.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/campaigns"
                className="rounded-full bg-forest-800 px-4 py-2 font-sans text-xs font-bold text-cream-50 transition hover:bg-forest-700"
              >
                View campaigns
              </Link>
              <Link
                href="/fundraisers/new"
                className="rounded-full border-2 border-forest-800 px-4 py-2 font-sans text-xs font-bold text-forest-800 transition hover:bg-forest-800 hover:text-cream-50"
              >
                Start a fundraiser
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
