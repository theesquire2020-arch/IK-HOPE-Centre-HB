import { NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns, donations } from "@/db/schema";
import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Admin-only: pending + active campaigns with aggregate raised totals. */
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: auth.reason === "unauthorized" ? 401 : 403 },
    );
  }

  const [pending, active, raisedRows] = await Promise.all([
    db.select().from(campaigns).where(eq(campaigns.status, "pending")).orderBy(desc(campaigns.createdAt)),
    db.select().from(campaigns).where(eq(campaigns.status, "approved")).orderBy(desc(campaigns.approvedAt)),
    db
      .select({
        campaignId: donations.campaignId,
        total: sql<number>`coalesce(sum(${donations.amountKes}), 0)`,
      })
      .from(donations)
      .where(and(eq(donations.status, "confirmed"), isNotNull(donations.campaignId)))
      .groupBy(donations.campaignId),
  ]);
  const raised = Object.fromEntries(raisedRows.map((r) => [r.campaignId as number, Number(r.total)]));

  const shape = (c: (typeof campaigns.$inferSelect)) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    targetKes: c.targetKes,
    raisedKes: raised[c.id] ?? 0,
    status: c.status,
    rejectReason: c.rejectReason,
    ownerName: c.ownerName,
    ownerEmail: c.ownerEmail,
    ownerPhone: c.ownerPhone,
    createdAt: c.createdAt,
  });

  return NextResponse.json({ pending: pending.map(shape), active: active.map(shape) });
}
