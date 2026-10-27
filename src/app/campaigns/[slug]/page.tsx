import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgressBar, SectionHeading, btn } from "@/components/ui";
import { ShareButton } from "@/components/share-button";
import { HeartIcon, ShieldIcon } from "@/components/icons";
import { getApprovedBySlug } from "@/lib/campaigns";
import { fmtKES, pct } from "@/lib/format";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await getApprovedBySlug(slug).catch(() => null);
  if (!c) return { title: "Campaign not found" };
  return {
    title: c.title,
    description: `${c.description.slice(0, 140)}… — ${fmtKES(c.raisedKes)} of ${fmtKES(
      c.targetKes,
    )} raised. Donate via M-PESA or Airtel Money.`,
    openGraph: {
      title: c.title,
      description: `${pct(c.raisedKes, c.targetKes)}% funded — give via M-PESA, Airtel Money or bank transfer.`,
      images: [{ url: c.image }],
    },
  };
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await getApprovedBySlug(slug);
  if (!c) notFound();

  const p = pct(c.raisedKes, c.targetKes);
  const remaining = Math.max(0, c.targetKes - c.raisedKes);

  return (
    <div>
      <section className="border-b border-cream-200 bg-cream-100/60">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-16">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.image}
              alt={c.title}
              className="aspect-[4/3] w-full rounded-[1.7rem] object-cover shadow-lg shadow-forest-900/15"
            />
          </div>
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-forest-950 px-3.5 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-gold-300">
              Live campaign · since {fmtDate(c.approvedAt)}
            </p>
            <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-forest-950 sm:text-4xl">
              {c.title}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-ink-600 sm:text-base">{c.description}</p>

            <div className="mt-7 rounded-2xl border border-cream-200 bg-cream-50 p-6 shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-3xl font-semibold text-forest-800">
                  {fmtKES(c.raisedKes)}
                </p>
                <p className="font-sans text-sm font-bold text-ink-600">
                  of {fmtKES(c.targetKes)} goal
                </p>
              </div>
              <ProgressBar
                className="mt-4 h-3.5"
                raised={c.raisedKes}
                target={c.targetKes}
                label={`${p}% of the goal raised`}
              />
              <div className="mt-3 flex items-center justify-between font-sans text-xs font-semibold text-ink-400">
                <span>{p}% funded</span>
                <span>
                  {remaining > 0 ? `${fmtKES(remaining)} to go` : "Goal reached — asante!"}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={`/donate?campaign=${c.slug}`} className={btn.gold + " !px-7 !py-3.5"}>
                <HeartIcon className="h-5 w-5" />
                Donate to this campaign
              </Link>
              <ShareButton
                url={`${process.env.NEXT_PUBLIC_BASE_URL || ""}/campaigns/${c.slug}`}
                text={`Help us fund “${c.title}” at IK Hope Centre — ${p}% funded so far.`}
              />
            </div>

            <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-ink-400">
              <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
              Only the total raised is ever shown here. Individual donor names, phones and
              amounts are visible to our team only, and 100% of confirmed gifts to this
              campaign go to this goal.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <SectionHeading
          kicker="How giving works"
          title="Three steps, verified on our servers"
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ["Choose & pay", "M-PESA STK push, Airtel Money, bank transfer with proof, or card — in KES, USD, EUR or GBP."],
            ["Provider confirms", "Safaricom, Airtel or your bank reports the payment to our servers. We never mark a gift as paid from a browser."],
            ["You get a receipt", "An instant receipt code, a downloadable e-receipt and — for bank gifts — a verification email."],
          ].map(([t, d], i) => (
            <div key={t} className="rounded-2xl border border-cream-200 bg-cream-50 p-6 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 font-sans text-sm font-bold text-forest-950">
                {i + 1}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-forest-900">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6">
        <div className="rounded-3xl bg-forest-950 px-8 py-10 text-center">
          <h2 className="font-display text-2xl font-semibold text-cream-50 sm:text-3xl">
            Every shilling moves this bar
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-cream-100/70">
            When we reach {fmtKES(c.targetKes)}, the work is done — and we'll publish exactly
            how the money was spent.
          </p>
          <Link href={`/donate?campaign=${c.slug}`} className={`${btn.gold} mt-6`}>
            <HeartIcon className="h-4.5 w-4.5" />
            Give to “{c.title}”
          </Link>
        </div>
      </section>
    </div>
  );
}
