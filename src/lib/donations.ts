import { db } from "@/db";
import { donations, transactions, campaigns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendReceipt, type ReceiptData } from "@/lib/receipt";

export async function recordTx(
  donationId: number,
  provider: string,
  event: string,
  status: string,
  detail?: string,
): Promise<void> {
  await db
    .insert(transactions)
    .values({ donationId, provider, event, status, detail: (detail || "").slice(0, 500) || null });
}

/** Idempotent server-side confirmation. ONLY callback handlers / admin
 *  verification may flip a donation to "confirmed" — never client code. */
export async function confirmDonation(
  id: number,
  provider: string,
  ref?: string,
  detail?: string,
): Promise<void> {
  const rows = await db.select().from(donations).where(eq(donations.id, id)).limit(1);
  const d = rows[0];
  if (!d) return;
  if (d.status === "confirmed") return; // idempotent
  await db
    .update(donations)
    .set({
      status: "confirmed",
      providerRef: ref || d.providerRef,
      verifiedAt: new Date(),
    })
    .where(eq(donations.id, id));
  await recordTx(id, provider, "confirmed", "confirmed", detail);

  let campaignTitle: string | null = null;
  if (d.campaignId) {
    const c = await db
      .select({ title: campaigns.title })
      .from(campaigns)
      .where(eq(campaigns.id, d.campaignId))
      .limit(1);
    campaignTitle = c[0]?.title ?? null;
  }
  const payload: ReceiptData = {
    receiptCode: d.receiptCode,
    donorName: d.donorName,
    donorEmail: d.donorEmail,
    donorPhone: d.donorPhone,
    amountOriginal: String(d.amountOriginal),
    currency: d.currency,
    amountKes: d.amountKes,
    method: d.method,
    status: "confirmed",
    campaignTitle,
    providerRef: ref || d.providerRef,
    createdAt: d.createdAt,
  };
  try {
    await sendReceipt(payload);
  } catch (e) {
    console.error("[receipt] failed:", (e as Error).message);
  }
}

export async function failDonation(id: number, provider: string, reason: string): Promise<void> {
  const rows = await db.select().from(donations).where(eq(donations.id, id)).limit(1);
  const d = rows[0];
  if (!d || d.status === "confirmed") return;
  await db.update(donations).set({ status: "failed", providerRef: provider || d.providerRef }).where(eq(donations.id, id));
  await recordTx(id, provider, "failed", "failed", reason);
}

/**
 * STUB MODE ONLY: mirrors the provider's server-to-server callback so the
 * full verify -> confirm -> receipt pipeline can be exercised without live
 * credentials. In production with real DARAJA_/AIRTEL_ keys this is never
 * called — the real callback endpoints drive confirmDonation().
 */
export function simulateProviderCallback(
  donationId: number,
  provider: string,
  ref: string,
): void {
  setTimeout(() => {
    confirmDonation(
      donationId,
      provider,
      ref,
      "simulated provider callback (stub mode)",
    ).catch((e) => console.error("[simulate] callback failed:", (e as Error).message));
  }, 2500);
}
