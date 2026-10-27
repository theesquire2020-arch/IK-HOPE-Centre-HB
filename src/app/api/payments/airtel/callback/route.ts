import { NextResponse } from "next/server";
import { db } from "@/db";
import { donations } from "@/db/schema";
import { and, inArray } from "drizzle-orm";
import { confirmDonation, failDonation, recordTx } from "@/lib/donations";
import { parseAirtelCallback } from "@/lib/payments/airtel";

export const dynamic = "force-dynamic";

/**
 * Airtel Money (Transact Africa) webhook — server-to-server only.
 * LIVE: Airtel signs webhooks; validate the signature header against
 * your Airtel API secret before trusting the payload.
 * Donation confirmation happens HERE only, never from the browser.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = parseAirtelCallback(body);

  if (!parsed.ok || !parsed.externalId) {
    console.warn("[airtel:callback] unrecognised payload", JSON.stringify(body || {}).slice(0, 300));
    return NextResponse.json({ status: "ok" });
  }

  const rows = await db
    .select()
    .from(donations)
    .where(
      and(
        inArray(donations.providerRef, [parsed.externalId]),
        inArray(donations.status, ["pending"]),
      ),
    )
    .limit(1);
  const d = rows[0];
  if (!d) {
    console.warn(`[airtel:callback] no pending donation for externalId ${parsed.externalId}`);
    return NextResponse.json({ status: "ok" });
  }

  await recordTx(d.id, "airtel", "callback", parsed.status || "unknown", JSON.stringify(body).slice(0, 500));

  if (parsed.status === "completed") {
    await confirmDonation(d.id, "airtel", parsed.externalId, "Airtel webhook completed");
  } else if (parsed.status === "failed") {
    await failDonation(d.id, "airtel", "declined or expired");
  }

  return NextResponse.json({ status: "ok" });
}
