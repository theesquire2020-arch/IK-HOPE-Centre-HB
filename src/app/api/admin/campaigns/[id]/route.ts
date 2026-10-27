import { NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { cleanText } from "@/lib/sanitize";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Admin-only: approve or reject a fundraiser. */
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
  if (!rateLimit(`adminecamp:${clientIp(req)}`, 30, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many actions, slow down." }, { status: 429 });
  }

  const { id } = await params;
  const campaignId = Number(id);
  if (!Number.isInteger(campaignId) || campaignId <= 0) {
    return NextResponse.json({ error: "Bad id." }, { status: 400 });
  }

  let body: { action?: string; reason?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const rows = await db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1);
  const c = rows[0];
  if (!c) return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
  if (c.status !== "pending") {
    return NextResponse.json({ error: "Campaign is not pending review." }, { status: 400 });
  }

  if (body.action === "approve") {
    await db
      .update(campaigns)
      .set({ status: "approved", approvedAt: new Date(), rejectReason: null })
      .where(eq(campaigns.id, campaignId));
    // LIVE: email c.ownerEmail with the live share link here (SMTP).
    return NextResponse.json({ ok: true, status: "approved" });
  }

  if (body.action === "reject") {
    const reason = cleanText(body.reason, 300) || "Does not meet our campaign policy.";
    await db
      .update(campaigns)
      .set({ status: "rejected", rejectReason: reason })
      .where(eq(campaigns.id, campaignId));
    return NextResponse.json({ ok: true, status: "rejected" });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
