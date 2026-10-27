import Link from "next/link";
import { Logo, LockIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/icons";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-forest-950 text-cream-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Logo className="h-11 w-11" />
              <div>
                <p className="font-display text-lg font-semibold text-cream-50">IK Hope Centre</p>
                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-gold-300">
                  Orphanage · Kenya
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream-100/75">
              A registered Kenyan orphanage providing shelter, education, healthcare and
              nutrition to 128 children — and walking with their families.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-cream-100/55">
              National Registration Bureau No. <strong className="text-cream-100/80">000-NGC-2358</strong>
              <br />
              KRA Exemption Certificate No. <strong className="text-cream-100/80">200/0012345</strong>
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                ["/about", "About us"],
                ["/programs", "Our programs"],
                ["/campaigns", "Live campaigns"],
                ["/fundraisers/new", "Start a fundraiser"],
                ["/donate", "Donate"],
                ["/contact", "Contact"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-cream-100/80 transition hover:text-gold-300">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
              Reach us
            </p>
            <ul className="mt-4 space-y-3 text-sm text-cream-100/80">
              <li className="flex gap-2.5">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
                <span>Lot 47, Kasarani Road, Nairobi, Kenya</span>
              </li>
              <li className="flex gap-2.5">
                <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
                <a href="tel:+254700123456" className="hover:text-gold-300">
                  +254 700 123 456
                </a>
              </li>
              <li className="flex gap-2.5">
                <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
                <a href="mailto:hello@ikhope.org" className="hover:text-gold-300">
                  hello@ikhope.org
                </a>
              </li>
            </ul>
            <p className="mt-5 rounded-xl border border-cream-100/15 bg-forest-900/60 p-3 text-xs leading-relaxed text-cream-100/65">
              <strong className="text-cream-100/85">Transparency pledge:</strong> donor names and
              amounts are never published. We publish quarterly financial summaries, and every
              donor receives an itemised receipt.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-cream-100/10 pt-6 text-xs text-cream-100/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} IK Hope Centre Orphanage. Habari za matumaini — news of
            hope.
          </p>
          <Link
            href="/admin/login"
            aria-label="Staff access"
            className="inline-flex items-center gap-1.5 text-cream-100/40 transition hover:text-gold-300"
          >
            <LockIcon className="h-3.5 w-3.5" />
            Staff
          </Link>
        </div>
      </div>
    </footer>
  );
}
