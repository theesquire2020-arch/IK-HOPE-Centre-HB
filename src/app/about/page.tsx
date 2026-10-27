import Link from "next/link";
import type { Metadata } from "next";
import { SectionHeading, btn } from "@/components/ui";
import {
  CheckIcon,
  HeartIcon,
  HomeIcon,
  SchoolIcon,
  ShieldIcon,
  SproutIcon,
  UsersIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "The story, mission, values and registration details of IK Hope Centre Orphanage — a registered Kenyan orphanage caring for 128 children in Nairobi since 2013.",
};

const VALUES = [
  {
    icon: HomeIcon,
    title: "Stability",
    body: "A predictable routine, a safe place to sleep and adults who stay — the foundation everything else is built on.",
  },
  {
    icon: SchoolIcon,
    title: "Education",
    body: "Schooling is non-negotiable. Fees, books, transport and exam support are funded before any other line item.",
  },
  {
    icon: HeartIcon,
    title: "Dignity",
    body: "Children are consulted, heard and protected. We publish aggregate totals — never the identities of the children in our care.",
  },
  {
    icon: SproutIcon,
    title: "Accountability",
    body: "Every donation is traceable to a receipt and a line in our quarterly report. Ask us for it; we answer.",
  },
];

const MILESTONES = [
  ["2013", "Founded with 14 children in a rented two-bedroom house in Kasarani."],
  ["2016", "First dormitory block built; enrolment reaches 60 children."],
  ["2019", "Partner clinic agreement — monthly health checks for every child."],
  ["2022", "Nutrition kitchen opens; 120+ balanced meals served daily."],
  ["2024", "128 children in our care; 94% school retention, 31 KCSE graduates."],
];

const TEAM = [
  ["Ikenna Kalu", "Founder & Executive Director", "20 years in child welfare across Kenya and Uganda."],
  ["Mercy Otieno", "Programs Manager", "Leads education, nutrition and health programs."],
  ["David Kariuki", "Finance & Compliance", "Publishes the quarterly financial summaries donors rely on."],
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-cream-200 bg-cream-100/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <SectionHeading
            kicker="About us"
            title="A small centre with an enormous promise"
            lede="IK Hope Centre began in 2013 with fourteen children, two rooms and one promise: no child in our care goes hungry, uneducated or unseen. Twelve years later, that promise is written into our school registers, meal logs and clinic files."
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/facility.jpg"
            alt="The IK Hope Centre main building and gardens"
            loading="lazy"
            className="aspect-[4/3] w-full rounded-[1.7rem] object-cover shadow-lg shadow-forest-900/15"
          />
          <div>
            <h2 className="font-display text-2xl font-semibold text-forest-900 sm:text-3xl">
              How it started
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink-600 sm:text-base">
              <p>
                Our founder, Ikenna Kalu, spent a decade running rescue programs for
                unaccompanied children in Western Kenya. When fourteen of those children —
                between them aged three to fifteen — outgrew the safehouse, he rented a small
                house in Kasarani and started calling it <em>IK Hope</em>.
              </p>
              <p>
                The growth was organic: families in crisis came to us, donors found us, and
                partners — a clinic, a school, a faith community in Kasarani — each took one
                part of the work and made it permanent. Today the centre is a registered
                orphanage with its own buildings, kitchen, study rooms and a family board that
                reviews the wellbeing of every child monthly.
              </p>
              <p>
                We also walk with over 200 family caregivers across Nairobi County, supporting
                children to remain with their own families whenever that is safe.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-cream-200 bg-cream-100/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
          <SectionHeading kicker="What we stand for" title="Four values, applied daily" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border border-cream-200 bg-cream-50 p-6 shadow-sm">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-forest-800 text-gold-300">
                  <v.icon className="h-5.5 w-5.5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-forest-900">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-display text-2xl font-semibold text-forest-900 sm:text-3xl">
              Milestones
            </h2>
            <ol className="mt-8 space-y-0">
              {MILESTONES.map(([year, text], i) => (
                <li key={year} className="relative flex gap-5 pb-8 last:pb-0">
                  {i < MILESTONES.length - 1 ? (
                    <span className="absolute left-[15px] top-8 h-full w-0.5 bg-cream-200" aria-hidden="true" />
                  ) : null}
                  <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-500 font-sans text-[10px] font-bold text-forest-950">
                    {year.slice(2)}
                  </span>
                  <div>
                    <p className="font-sans text-sm font-bold text-forest-900">{year}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-600">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-forest-200 bg-forest-50 p-6">
              <div className="flex items-center gap-3">
                <ShieldIcon className="h-6 w-6 text-forest-800" />
                <h3 className="font-display text-lg font-semibold text-forest-900">
                  Registration & compliance
                </h3>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm text-ink-700">
                {[
                  "NGCB Registration No. 000-NGC-2358",
                  "KRA Exemption Certificate 200/0012345",
                  "Licensed by the Children's Department, Kenya",
                  "Audited annually — reports available on request",
                ].map((li) => (
                  <li key={li} className="flex items-start gap-2.5">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                    {li}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-cream-200 bg-cream-50 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <UsersIcon className="h-6 w-6 text-forest-800" />
                <h3 className="font-display text-lg font-semibold text-forest-900">Leadership</h3>
              </div>
              <ul className="mt-4 space-y-4">
                {TEAM.map(([name, role, bio]) => (
                  <li key={name} className="border-b border-cream-200 pb-4 last:border-0 last:pb-0">
                    <p className="font-sans text-sm font-bold text-forest-900">
                      {name} <span className="font-semibold text-gold-600">· {role}</span>
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-600">{bio}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-forest-950 p-6 text-center">
              <p className="font-display text-lg font-semibold text-cream-50">
                Where do your funds go?
              </p>
              <p className="mt-2 text-xs leading-relaxed text-cream-100/70">
                45% education · 30% meals & nutrition · 15% healthcare · 10% operations
              </p>
              <Link href="/donate" className={`${btn.gold} mt-4 !px-6 !py-2.5 !text-xs`}>
                Fund a specific goal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
