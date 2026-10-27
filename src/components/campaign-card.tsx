import Link from "next/link";
import { ProgressBar, btn } from "@/components/ui";
import { fmtKES, pct } from "@/lib/format";

export function CampaignCard({
  slug,
  title,
  image,
  targetKes,
  raisedKes,
  blurb,
}: {
  slug: string;
  title: string;
  image: string;
  targetKes: number;
  raisedKes: number;
  blurb: string;
}) {
  const p = pct(raisedKes, targetKes);
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-cream-200 bg-cream-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-forest-900/10">
      <Link
        href={`/campaigns/${slug}`}
        className="relative block aspect-[16/10] overflow-hidden"
        aria-label={`View campaign: ${title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-forest-950/80 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-gold-300 backdrop-blur">
          Live campaign
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-forest-900">
          <Link href={`/campaigns/${slug}`} className="hover:text-forest-700">
            {title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-600">{blurb}</p>
        <div className="mt-auto pt-5">
          <ProgressBar raised={raisedKes} target={targetKes} label={`${p}% of goal reached`} />
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-sans text-sm font-bold text-forest-800">
              {fmtKES(raisedKes)}
              <span className="ml-1.5 text-xs font-semibold text-ink-400">{p}%</span>
            </span>
            <span className="font-sans text-xs text-ink-400">of {fmtKES(targetKes)}</span>
          </div>
          <Link
            href={`/donate?campaign=${slug}`}
            className={`${btn.gold} mt-4 w-full !py-2.5 !text-xs`}
          >
            Support this campaign
          </Link>
        </div>
      </div>
    </article>
  );
}
