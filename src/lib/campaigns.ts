import { db } from "@/db";
import { campaigns, donations } from "@/db/schema";
import { and, desc, eq, isNotNull, sql } from "drizzle-orm";

export type CampaignWithRaised = (typeof campaigns.$inferSelect) & {
  raisedKes: number;
};

/** SUM(amountKes) of CONFIRMED donations per campaign — the only
 *  aggregate public campaign pages are ever allowed to show. */
export async function raisedByCampaign(): Promise<Record<number, number>> {
  const rows = await db
    .select({
      campaignId: donations.campaignId,
      total: sql<number>`coalesce(sum(${donations.amountKes}), 0)`,
    })
    .from(donations)
    .where(and(eq(donations.status, "confirmed"), isNotNull(donations.campaignId)))
    .groupBy(donations.campaignId);
  return Object.fromEntries(
    rows.map((r) => [(r.campaignId as number), Number(r.total)]),
  );
}

export async function listApprovedCampaigns(limit?: number): Promise<CampaignWithRaised[]> {
  const rows = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.status, "approved"))
    .orderBy(desc(campaigns.approvedAt))
    .limit(limit ?? 50);
  const raised = await raisedByCampaign();
  return rows.map((c) => ({ ...c, raisedKes: raised[c.id] ?? 0 }));
}

export async function getApprovedBySlug(
  slug: string,
): Promise<CampaignWithRaised | null> {
  const rows = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.slug, slug), eq(campaigns.status, "approved")))
    .limit(1);
  if (!rows.length) return null;
  const raised = await raisedByCampaign();
  return { ...rows[0], raisedKes: raised[rows[0].id] ?? 0 };
}

/** Site-wide confirmed totals for the hero stat. */
export async function confirmedTotals(): Promise<{ kes: number; count: number }> {
  const rows = await db
    .select({
      kes: sql<number>`coalesce(sum(${donations.amountKes}), 0)`,
      count: sql<number>`coalesce(count(*), 0)`,
    })
    .from(donations)
    .where(eq(donations.status, "confirmed"))
    .limit(1);
  return { kes: Number(rows[0]?.kes ?? 0), count: Number(rows[0]?.count ?? 0) };
}
