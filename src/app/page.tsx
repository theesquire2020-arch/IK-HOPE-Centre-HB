import Link from "next/link";
import { CampaignCard } from "@/components/campaign-card";
import { SectionHeading, Stat, btn } from "@/components/ui";
import {
  ArrowRightIcon,
  CheckIcon,
  HeartIcon,
  ShieldIcon,
  SproutIcon,
} from "@/components/icons";
import { listApprovedCampaigns, confirmedTotals } from "@/lib/campaigns";
import { fmtKES } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, totals] = await Promise.all([
    listApprovedCampaigns(3),
    confirmedTotals(),
  ]);

  return (
    <>
      {/* ------------------------------ HERO ------------------------------ */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-gold-100 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-forest-100 blur-3xl" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-forest-50 px-3.5 py-1.5 font-sans text-[11px] font-bold uppercase tracking-wider text-forest-800">
              <ShieldIcon className="h-3.5 w-3.5 text-gold-600" />
              Registered Kenyan NGO · Reg. 000-NGC-2358
            </p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] text-forest-950 sm:text-5xl lg:text-[3.4rem]">
              Every child deserves a home that{" "}
              <span className="relative inline-block text-gold-600">
                hopes
                <svg
                  viewBox="0 0 120 10"
                  className="absolute -bottom-1 left-0 w-full text-gold-400"
                  aria-hidden="true"
                >
                  <path d="M2 7c30-5 86-5 116-2" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>{" "}
              with them.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
              IK Hope Centre is home to 128 children in Nairobi. We fund their school fees,
              three warm meals a day, healthcare and a family that never lets go — and
              your gift makes all of it possible.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/donate" className={btn.gold + " !px-7 !py-3.5 !text-base"}>
                <HeartIcon className="h-5 w-5" />
                Donate now
              </Link>
              <Link href="/fundraisers/new" className={btn.outline + " !px-7 !py-3.5 !text-base"}>
                Start a Fundraiser
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-xs font-semibold text-ink-400">
              <span className="inline-flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-forest-600" /> M-PESA STK Push
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-forest-600" /> Airtel Money
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-forest-600" /> Bank transfer
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-forest-600" /> Instant e-receipts
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] border-2 border-gold-400/60" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero.jpg"
              alt="Children of IK Hope Centre in uniform, walking together toward school at golden hour"
              className="relative aspect-[4/3] w-full rounded-[1.7rem] object-cover shadow-xl shadow-forest-900/20"
            />
            <div className="absolute -bottom-6 left-4 right-4 rounded-2xl border border-cream-200 bg-cream-50/95 p-4 shadow-lg backdrop-blur sm:left-8 sm:right-auto sm:min-w-72">
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-gold-600">
                Raised together, live
              </p>
              <p className="mt-1 font-display text-3xl font-semibold text-forest-900">
                {fmtKES(totals.kes)}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-ink-400">
                from {totals.count.toLocaleString()} confirmed gifts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------- IMPACT STATS -------------------------- */}
      <section aria-label="Impact statistics" className="border-y border-cream-200 bg-forest-950">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4">
          <Stat dark value="128" label="Children in our care" />
          <Stat dark value="94%" label="School retention rate" />
          <Stat dark value="42,000+" label="Meals served this year" />
          <Stat dark value="12 yrs" label="Serving Nairobi County" />
        </div>
      </section>

      {/* ----------------------------- MISSION ---------------------------- */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative order-2 lg:order-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/facility.jpg"
              alt="The IK Hope Centre shelter building with its wide veranda and gardens"
              loading="lazy"
              className="aspect-[4/3] w-full rounded-[1.7rem] object-cover shadow-lg shadow-forest-900/15"
            />
            <div className="absolute -right-3 -top-5 flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2 font-sans text-xs font-bold text-forest-950 shadow-md sm:-right-6">
              <SproutIcon className="h-4 w-4" />
              Since 2013
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeading
              kicker="Our mission"
              title="Stability first. Education always. Dignity, every single day."
              lede="We exist so that a child who lost everything can still grow up with a classroom, a bed, a warm meal and people who know their name. Our programs are simple, funded by people like you, and reported on every quarter."
            />
            <ul className="mt-7 space-y-4">
              {[
                ["Shelter & family", "Safe dormitories, daily care and a family board that reviews every child's wellbeing."],
                ["Education", "Fees, uniforms and learning kits through KCSE — plus after-school study support."],
                ["Health & nutrition", "A clinic partnership, regular check-ups and three balanced meals a day."],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-800">
                    <CheckIcon className="h-4.5 w-4.5" />
                  </span>
                  <p className="text-sm leading-relaxed text-ink-600">
                    <strong className="font-sans font-bold text-forest-900">{t}.</strong> {d}
                  </p>
                </li>
              ))}
            </ul>
            <Link href="/about" className={`${btn.ghost} mt-7`}>
              More about us <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------ FEATURED CAMPAIGNS ----------------------- */}
      <section className="border-y border-cream-200 bg-cream-100/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              kicker="Give with purpose"
              title="Live campaigns, live progress"
              lede="Every campaign shows only the total raised — never who gave. Pick a cause and watch the bar move with your gift."
            />
            <Link href="/campaigns" className={`${btn.ghost}`}>
              View all campaigns <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CampaignCard
                key={c.id}
                slug={c.slug}
                title={c.title}
                image={c.image}
                targetKes={c.targetKes}
                raisedKes={c.raisedKes}
                blurb={c.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------- TRANSPARENCY ---------------------------- */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            [
              "Every shilling is traceable",
              "Donations are stored with the exact currency and exchange rate used. Bank transfers are verified line-by-line before they count toward any goal.",
              ShieldIcon,
            ],
            [
              "Receipts, not promises",
              "You get an instant receipt code and an emailed e-receipt. Donor details are visible to our team only — the public sees aggregate totals, always.",
              CheckIcon,
            ],
            [
              "Quarterly financial summaries",
              "We publish where the money went — classrooms, meals, medicines — and answer every donor question within two business days.",
              SproutIcon,
            ],
          ].map(([title, body, Icon]) => (
            <div
              key={title as string}
              className="rounded-2xl border border-cream-200 bg-cream-50 p-6 shadow-sm"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-forest-800 text-gold-300">
                <Icon className="h-5.5 w-5.5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-forest-900">
                {title as string}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{body as string}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------- TESTIMONIALS -------------------------- */}
      <section className="border-t border-cream-200 bg-forest-950">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <SectionHeading
            dark
            kicker="Voices"
            title="Trusted by the people who give"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              [
                "I give 1,500 shillings every month by M-PESA. The receipt lands before my tea is done, and the quarterly report shows exactly where it went.",
                "Beatrice N.",
                "Monthly donor, Nairobi",
              ],
              [
                "I ran a fundraiser for my daughter's first birthday. Watching the bar move as friends donated was the most powerful thing I've done for a cause.",
                "Sam K.",
                "Fundraiser, Kampala",
              ],
              [
                "As a partner clinic we've seen what steady funding does: children who come in underweight leave a year later in full-time school. IK Hope keeps its word.",
                "Dr. W. Maina",
                "Partner paediatrician",
              ],
            ].map(([quote, name, role]) => (
              <figure
                key={name as string}
                className="flex flex-col rounded-2xl border border-cream-100/10 bg-forest-900/50 p-6"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-gold-400" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M10 7H6a3 3 0 0 0-3 3v7h7v-7H6.5A2.5 2.5 0 0 1 9 7.5V7h1Zm11 0h-4a3 3 0 0 0-3 3v7h7v-7h-3.5a2.5 2.5 0 0 1 2.5-2.5V7h1Z"
                  />
                </svg>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-cream-100/85">
                  “{quote as string}”
                </blockquote>
                <figcaption className="mt-5">
                  <p className="font-sans text-sm font-bold text-cream-50">{name as string}</p>
                  <p className="text-xs text-cream-100/55">{role as string}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ CTA -------------------------------- */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-forest-800 px-6 py-14 text-center sm:px-12">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-forest-700/60 blur-2xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-gold-500/20 blur-3xl" aria-hidden="true" />
          <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-semibold leading-tight text-cream-50 sm:text-4xl">
            2,500 shillings feeds a child for a week.
            <br className="hidden sm:block" /> What will your gift do?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm leading-relaxed text-cream-100/80 sm:text-base">
            Donations in KES, USD, EUR or GBP — paid in seconds with M-PESA or Airtel Money,
            or by bank transfer with verification.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/donate" className={btn.gold + " !px-8 !py-3.5 !text-base"}>
              <HeartIcon className="h-5 w-5" />
              Donate now
            </Link>
            <Link
              href="/fundraisers/new"
              className="inline-flex items-center gap-2 rounded-full border-2 border-cream-50/70 px-7 py-3 font-sans text-base font-bold text-cream-50 transition hover:bg-cream-50 hover:text-forest-900"
            >
              Start a Fundraiser
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
