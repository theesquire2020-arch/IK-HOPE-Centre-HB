import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact IK Hope Centre Orphanage in Nairobi, Kenya — visits, partnerships, press or donor questions. We reply within two business days.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="max-w-2xl">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
          Contact
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest-900 sm:text-4xl">
          Talk to us
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
          Donor questions, partnership ideas, press, or asking to visit the children (arranged
          privately with the family board) — write to us and we'll reply within two business
          days.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <ContactForm />

        <div className="space-y-5">
          {[
            [PinIcon, "Visit", "Lot 47, Kasarani Road, Nairobi, Kenya"],
            [PhoneIcon, "Call", "+254 700 123 456 (Mon–Fri, 8am–5pm EAT)"],
            [MailIcon, "Email", "hello@ikhope.org · giving@ikhope.org"],
            [ClockIcon, "Hours", "Office 8:00–17:00 EAT · Kitchen 6:00, 12:00, 18:00"],
          ].map(([Icon, t, d]) => (
            <div key={t as string} className="flex items-start gap-4 rounded-2xl border border-cream-200 bg-cream-50 p-5 shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-800 text-gold-300">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-sans text-sm font-bold text-forest-900">{t as string}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-600">{d as string}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
