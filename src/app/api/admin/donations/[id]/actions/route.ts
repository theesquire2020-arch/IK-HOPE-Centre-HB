import { NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns, donations } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { recordTx } from "@/lib/donations";
import { sendReceipt, sendThankYou, type ReceiptData } from "@/lib/receipt";
import { cleanText } from "@/lib/sanitize";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Admin-only actions:
 *  - verify   : bank_pending -> confirmed (marks verifiedAt, emails receipt)
 *  - reject   : bank_pending -> rejected
 *  - thankyou : send a personal thank-you email to the donor
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: auth.reason === "unauthorized" ? 401 : 403 },
    );
  }
  if (!rateLimit(`adminact:${clientIp(req)}`, 60, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many actions, slow down." }, { status: 429 });
  }

  const { id } = await params;
  const donationId = Number(id);
  if (!Number.isInteger(donationId) || donationId <= 0) {
    return NextResponse.json({ error: "Bad id." }, { status: 400 });
  }

  let body: { action?: string; note?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  const action = body.action;

  const rows = await db.select().from(donations).where(eq(donations.id, donationId)).limit(1);
  const d = rows[0];
  if (!d) return NextResponse.json({ error: "Donation not found." }, { status: 404 });

  let campaignTitle: string | null = null;
  if (d.campaignId) {
    const c = await db
      .select({ title: campaigns.title })
      .from(campaigns)
      .where(eq(campaigns.id, d.campaignId))
      .limit(1);
    campaignTitle = c[0]?.title ?? null;
  }

  const base: Omit<ReceiptData, "status" | "providerRef" | "createdAt"> = {
    receiptCode: d.receiptCode,
    donorName: d.donorName,
    donorEmail: d.donorEmail,
    donorPhone: d.donorPhone,
    amountOriginal: String(d.amountOriginal),
    currency: d.currency,
    amountKes: d.amountKes,
    method: d.method,
    campaignTitle,
  };

  if (action === "verify") {
    if (d.status !== "bank_pending") {
      return NextResponse.json({ error: "Only bank transfers can be verified here." }, { status: 400 });
    }
    await db
      .update(donations)
      .set({ status: "confirmed", verifiedAt: new Date() })
      .where(eq(donations.id, donationId));
    await recordTx(donationId, "admin", "admin_verify", "confirmed", `verified by ${auth.admin.email}`);
    try {
      await sendReceipt({
        ...base,
        status: "confirmed",
        providerRef: d.transferRef,
        createdAt: d.createdAt,
      });
    } catch (e) {
      console.error("[receipt]", (e as Error).message);
    }
    return NextResponse.json({ ok: true, status: "confirmed" });
  }

  if (action === "reject") {
    if (d.status !== "bank_pending") {
      return NextResponse.json({ error: "Only pending bank transfers can be rejected." }, { status: 400 });
    }
    const reason = cleanText(body.note, 200) || "Could not be matched to a transfer.";
    await db
      .update(donations)
      .set({ status: "rejected" })
      .where(eq(donations.id, donationId));
    await recordTx(donationId, "admin", "admin_verify", "rejected", reason);
    return NextResponse.json({ ok: true, status: "rejected" });
  }

  if (action === "thankyou") {
    const note = cleanText(body.note, 800);
    if (!d.donorEmail) {
      return NextResponse.json({ error: "This donor has no email on file." }, { status: 400 });
    }
    if (note.length < 10) {
      return NextResponse.json({ error: "Write a short thank-you message (min 10 characters)." }, { status: 400 });
    }
    await db
      .update(donations)
      .set({ thankYouNote: note, thankYouSentAt: new Date() })
      .where(eq(donations.id, donationId));
    try {
      await sendThankYou(d.donorEmail, d.donorName.split(" ")[0], note, d.receiptCode);
    } catch (e) {
      console.error("[thankyou]", (e as Error).message);
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
