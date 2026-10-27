import { NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns, donations } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function csvEscape(v: string | number | null): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Admin-only: export the full donation register as CSV. */
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: auth.reason === "unauthorized" ? 401 : 403 },
    );
  }
  if (!rateLimit(`export:${clientIp(req)}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Export rate limit reached (10/hour)." }, { status: 429 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "";

  const rows = await db
    .select({ d: donations, campaignTitle: campaigns.title })
    .from(donations)
    .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
    .where(status ? eq(donations.status, status) : undefined)
    .orderBy(desc(donations.createdAt))
    .limit(5000);

  const header = [
    "receipt_code",
    "date",
    "donor_name",
    "donor_email",
    "donor_phone",
    "amount_original",
    "currency",
    "amount_kes",
    "rate_used",
    "method",
    "status",
    "provider_ref",
    "transfer_ref",
    "campaign",
    "message",
  ];
  const lines = rows.map((r) =>
    [
      r.d.receiptCode,
      r.d.createdAt.toISOString(),
      r.d.donorName,
      r.d.donorEmail,
      r.d.donorPhone,
      r.d.amountOriginal,
      r.d.currency,
      r.d.amountKes,
      r.d.rateUsed,
      r.d.method,
      r.d.status,
      r.d.providerRef,
      r.d.transferRef,
      r.campaignTitle,
      r.d.message,
    ]
      .map(csvEscape)
      .join(","),
  );

  const csv = [header.join(","), ...lines].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ikhope-donations-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
