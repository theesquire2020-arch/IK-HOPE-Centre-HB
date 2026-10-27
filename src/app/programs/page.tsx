import Link from "next/link";
import type { Metadata } from "next";
import { SectionHeading, btn } from "@/components/ui";
import { CheckIcon, HeartIcon, HomeIcon, MedicalIcon, MealIcon, SchoolIcon, ShieldIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Our Programs",
  description:
    "Education, shelter, healthcare and nutrition programs at IK Hope Centre Orphanage in Nairobi, Kenya. See what your donation covers in each program.",
};

const PROGRAMS = [
  {
    icon: SchoolIcon,
    image: "/images/education.jpg",
    imageAlt: "A bright classroom at IK Hope Centre with desks and a chalkboard",
    name: "Education",
    stat: "94% retention · 31 KCSE graduates",
    body: "From early grades to KCSE, every child's fees, uniform, books and learning kit are fully funded. Our study room opens at 4pm daily, and the two children with the highest marks each year receive a laptop and a mentor from our alumni network.",
    covers: ["School fees & exam fees", "Uniforms, books, stationery", "After-school study support", "Spectacles & school health forms"],
  },
  {
    icon: HomeIcon,
    image: "/images/facility.jpg",
    imageAlt: "The IK Hope Centre shelter building",
    name: "Shelter & Family",
    stat: "128 children · monthly family-board reviews",
    body: "Safe, supervised dormitories with age-appropriate groups, and a family board that reviews every child's wellbeing, goals and — where possible — the path back to family. We also support 200+ family caregivers across Nairobi County so children can stay home safely.",
    covers: ["Dormitories & daily care", "Family reunification work", "Caregiver stipends & training", "Clothing & personal care"],
  },
  {
    icon: MedicalIcon,
    image: "/images/healthcare.jpg",
    imageAlt: "A clean clinic room with medical supplies",
    name: "Healthcare",
    stat: "Monthly check-ups · clinic partnership since 2019",
    body: "A partner clinic runs monthly screening days: vaccinations, deworming, dental, sight and general checks, with medicines and follow-up appointments covered. Children with chronic conditions get a personal health plan and transport to Nairobi's specialist hospitals.",
    covers: ["Screenings & vaccinations", "Medicines & lab tests", "Specialist follow-ups & transport", "Mental health & counselling"],
  },
  {
    icon: MealIcon,
    image: "/images/nutrition.jpg",
    imageAlt: "Meals being prepared on a large stove in the community kitchen",
    name: "Nutrition",
    stat: "3 meals/day · 42,000+ meals this year",
    body: "Three balanced meals a day, cooked in our kitchen with food grown in the centre's own garden beds. Underweight children follow a catch-up nutrition plan until they reach their target — a program that has lifted every single child who has completed it.",
    covers: ["Breakfast, lunch & dinner", "Catch-up nutrition plans", "Garden produce & clean water", "Vitamin & mineral support"],
  },
];

export default function ProgramsPage() {
  return (
    <>
      <section className="border-b border-cream-200 bg-cream-100/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <SectionHeading
            kicker="Our programs"
            title="Four programs. One promise: no child left short."
            lede="Each program is funded by real donations, tracked in our accounts and reported every quarter. Choose one to support — or give to the centre and we'll put it where it's needed most."
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl space-y-16 px-4 py-14 sm:px-6 lg:space-y-24 lg:py-20">
        {PROGRAMS.map((p, i) => (
          <article key={p.name} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <div className={i % 2 === 1 ? "lg:order-2" : ""}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image}
                alt={p.imageAlt}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-[1.7rem] object-cover shadow-lg shadow-forest-900/15"
              />
            </div>
            <div className={i % 2 === 1 ? "lg:order-1" : ""}>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-forest-800 text-gold-300">
                  <p.icon className="h-5.5 w-5.5" />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-forest-900">{p.name}</h2>
                  <p className="font-sans text-xs font-bold uppercase tracking-wider text-gold-600">
                    {p.stat}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-600 sm:text-base">{p.body}</p>
              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {p.covers.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-ink-700">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                    {c}
                  </li>
                ))}
              </ul>
              <Link href="/donate" className={`${btn.forest} mt-7 !text-xs`}>
                Fund {p.name.toLowerCase()}
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="border-t border-cream-200 bg-forest-950">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 text-center sm:px-6">
          <ShieldIcon className="mx-auto h-8 w-8 text-gold-300" />
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-2xl font-semibold text-cream-50 sm:text-3xl">
            We protect the identities of the children in our care
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-cream-100/70">
            You will never see a child's name, photo or story published by us. Donor receipts
            are private, campaign pages show only aggregate totals, and any visit to meet the
            children is arranged privately with the family board.
          </p>
          <Link
            href="/donate"
            className={`${btn.gold} mt-7`}
          >
            <HeartIcon className="h-4.5 w-4.5" />
            Give to a program
          </Link>
        </div>
      </section>
    </>
  );
}
