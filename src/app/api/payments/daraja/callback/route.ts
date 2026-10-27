import { NextResponse } from "next/server";
import { db } from "@/db";
import { donations } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { confirmDonation, failDonation, recordTx } from "@/lib/donations";
import { parseDarajaCallback } from "@/lib/payments/daraja";

export const dynamic = "force-dynamic";

/**
 * Safaricom Daraja result callback (server-to-server only).
 *
 * SECURITY:
 * - A donation is only confirmed here — the browser can never mark a
 *   payment as confirmed.
 * - Always reply 200 with ResultCode 0 to stop Safaricom retries.
 */
export async function POST(req: Request) {
  const expectedToken = process.env.DARAJA_CALLBACK_TOKEN;
  if (process.env.NODE_ENV === "production" && !expectedToken) {
    console.error("[daraja:callback] DARAJA_CALLBACK_TOKEN is required in production");
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Received" });
  }
  if (expectedToken) {
    const suppliedToken = new URL(req.url).searchParams.get("token");
    if (!suppliedToken || suppliedToken !== expectedToken) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Received" });
    }
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Received" });
  }

  const parsed = parseDarajaCallback(body);

  if (!Number.isNaN(parsed.resultCode) && parsed.resultCode === 1032) {
    // "queued" — the customer hasn't entered their PIN yet; nothing to do.
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Queued" });
  }

  const ref = parsed.checkoutRequestId;

  if (!ref) {
    console.warn("[daraja:callback] unrecognised payload shape", JSON.stringify(body).slice(0, 400));
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Received" });
  }

  // Match by CheckoutRequestID (live) or receipt code (stub simulation)
  const rows = await db
    .select()
    .from(donations)
    .where(
      and(
        inArray(donations.providerRef, [ref]),
        inArray(donations.status, ["pending"]),
      ),
    )
    .limit(1);
  const d = rows[0];

  if (!d) {
    console.warn(`[daraja:callback] no pending donation for ref ${ref}`);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Received" });
  }

  await recordTx(d.id, "daraja", "callback", parsed.ok ? "success" : "declined", JSON.stringify(body).slice(0, 500));

  if (parsed.ok) {
    await confirmDonation(d.id, "daraja", parsed.mpesaRef || ref, "Daraja callback ResultCode 0");
  } else {
    await failDonation(d.id, "daraja", parsed.error || "declined by customer");
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Received" });
}
