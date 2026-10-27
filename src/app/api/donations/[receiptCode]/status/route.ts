import { NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns, donations } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Donor polls their OWN receipt. Returns only the minimal public facts
 * about that receipt — never other donors or aggregate donor lists.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ receiptCode: string }> },
) {
  const { receiptCode } = await params;
  const code = receiptCode.trim().toUpperCase();
  if (!/^IKH-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
    return NextResponse.json({ error: "Unknown receipt." }, { status: 404 });
  }
  const rows = await db
    .select({
      d: donations,
      campaignTitle: campaigns.title,
    })
    .from(donations)
    .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
    .where(eq(donations.receiptCode, code))
    .limit(1);
  const r = rows[0];
  if (!r) return NextResponse.json({ error: "Unknown receipt." }, { status: 404 });
  return NextResponse.json({
    receiptCode: r.d.receiptCode,
    status: r.d.status,
    method: r.d.method,
    amountOriginal: String(r.d.amountOriginal),
    currency: r.d.currency,
    amountKes: r.d.amountKes,
    campaignTitle: r.campaignTitle,
    donorName: r.d.donorName,
    createdAt: r.d.createdAt,
  });
}
