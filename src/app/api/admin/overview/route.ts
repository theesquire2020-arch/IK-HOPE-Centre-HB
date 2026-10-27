import { NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns, donations } from "@/db/schema";
import { desc, eq, gt, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Admin-only dashboard summary. */
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.reason === "origin" ? "Cross-origin request rejected." : "Not authenticated" },
      { status: auth.reason === "unauthorized" ? 401 : 403 },
    );
  }

  const monthAgo = new Date(Date.now() - 30 * 86400000);

  const [totals, recent, pendingBanks, pendingCampaigns] = await Promise.all([
    db
      .select({
        totalKes: sql<number>`coalesce(sum(${donations.amountKes}), 0)`,
        totalCount: sql<number>`count(*)`,
        monthKes: sql<number>`coalesce(sum(case when ${donations.createdAt} >= ${monthAgo} then ${donations.amountKes} else 0 end), 0)`,
        monthCount: sql<number>`coalesce(sum(case when ${donations.createdAt} >= ${monthAgo} then 1 else 0 end), 0)`,
      })
      .from(donations)
      .where(eq(donations.status, "confirmed"))
      .limit(1),
    db
      .select({ d: donations, campaignTitle: campaigns.title })
      .from(donations)
      .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
      .orderBy(desc(donations.createdAt))
      .limit(8),
    db
      .select({ n: sql<number>`count(*)` })
      .from(donations)
      .where(eq(donations.status, "bank_pending"))
      .limit(1),
    db.select({ n: sql<number>`count(*)` }).from(campaigns).where(eq(campaigns.status, "pending")).limit(1),
  ]);

  return NextResponse.json({
    totalKes: Number(totals[0].totalKes),
    totalCount: Number(totals[0].totalCount),
    monthKes: Number(totals[0].monthKes),
    monthCount: Number(totals[0].monthCount),
    pendingBanks: Number(pendingBanks[0]?.n ?? 0),
    pendingCampaigns: Number(pendingCampaigns[0]?.n ?? 0),
    recent: recent.map((r) => ({
      id: r.d.id,
      receiptCode: r.d.receiptCode,
      donorName: r.d.donorName,
      amountKes: r.d.amountKes,
      amountOriginal: String(r.d.amountOriginal),
      currency: r.d.currency,
      method: r.d.method,
      status: r.d.status,
      campaignTitle: r.campaignTitle,
      createdAt: r.d.createdAt,
    })),
  });
}
