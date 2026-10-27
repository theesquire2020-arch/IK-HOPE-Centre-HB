import { NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns, donations } from "@/db/schema";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const VALID_STATUS = ["pending", "bank_pending", "confirmed", "failed", "rejected"];
const VALID_METHOD = ["mpesa", "airtel", "bank", "card"];

/** Admin-only: full donation register with filters. */
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: auth.reason === "unauthorized" ? 401 : 403 },
    );
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "";
  const method = url.searchParams.get("method") ?? "";
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 60);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 200) || 200, 500);

  const where = and(
    status && VALID_STATUS.includes(status) ? eq(donations.status, status) : undefined,
    method && VALID_METHOD.includes(method) ? eq(donations.method, method) : undefined,
    q
      ? or(
          ilike(donations.donorName, `%${q}%`),
          ilike(donations.receiptCode, `%${q.toUpperCase()}%`),
          ilike(donations.donorEmail, `%${q}%`),
        )
      : undefined,
  );

  const rows = await db
    .select({ d: donations, campaignTitle: campaigns.title })
    .from(donations)
    .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
    .where(where)
    .orderBy(desc(donations.createdAt))
    .limit(limit);

  return NextResponse.json(
    rows.map((r) => ({
      id: r.d.id,
      receiptCode: r.d.receiptCode,
      donorName: r.d.donorName,
      donorEmail: r.d.donorEmail,
      donorPhone: r.d.donorPhone,
      amountOriginal: String(r.d.amountOriginal),
      currency: r.d.currency,
      amountKes: r.d.amountKes,
      rateUsed: String(r.d.rateUsed),
      method: r.d.method,
      status: r.d.status,
      providerRef: r.d.providerRef,
      transferRef: r.d.transferRef,
      message: r.d.message,
      hasProof: Boolean(r.d.proofPath),
      proofUrl: r.d.proofPath ? `/api/admin/proof/${r.d.id}` : null,
      campaignTitle: r.campaignTitle,
      thankYouSentAt: r.d.thankYouSentAt,
      verifiedAt: r.d.verifiedAt,
      createdAt: r.d.createdAt,
    })),
  );
}
