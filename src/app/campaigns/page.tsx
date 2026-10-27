import type { Metadata } from "next";
import Link from "next/link";
import { CampaignCard } from "@/components/campaign-card";
import { SectionHeading, btn } from "@/components/ui";
import { ArrowRightIcon } from "@/components/icons";
import { listApprovedCampaigns } from "@/lib/campaigns";
import { fmtKES } from "@/lib/format";

export const metadata: Metadata = {
  title: "Live Campaigns",
  description:
    "Browse live fundraising campaigns at IK Hope Centre — school fees, the new kitchen, health check-ups and more. Pages show only aggregate totals, never donor details.",
};

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const all = await listApprovedCampaigns();
  const totalOpen = all.reduce((s, c) => s + Math.max(0, c.targetKes - c.raisedKes), 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <SectionHeading
        kicker="Campaigns"
        title="Live campaigns with live progress"
        lede={`Across ${all.length} open campaigns, the community still needs ${fmtKES(
          totalOpen,
        )} to reach every goal. Campaign pages show only the total raised — donor names and amounts are never published.`}
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {all.map((c) => (
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

      <div className="mt-14 rounded-3xl border border-cream-200 bg-cream-100/70 p-8 text-center sm:p-10">
        <h2 className="font-display text-2xl font-semibold text-forest-900">
          Your goal, our children
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-600">
          Birthday, anniversary, retirement or team challenge — start a fundraiser for any of
          our goals. We review it within 24 hours and send you a shareable page with a
          progress bar.
        </p>
        <Link href="/fundraisers/new" className={`${btn.forest} mt-6`}>
          Start a Fundraiser <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
