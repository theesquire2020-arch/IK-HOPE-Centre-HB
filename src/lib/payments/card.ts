/**
 * Card fallback via Flutterwave (PayStack uses the same shape:
 * POST /transaction/initialize with Authorization header).
 *
 * LIVE: POST https://api.flutterwave.com/v3/charges
 *   Authorization: Bearer ${FLUTTERWAVE_SECRET_KEY}
 *   Body: { amount, currency: "KES", txRef, callbackUrl,
 *           customer: { name, email, phone },
 *           customizations: { title: "IK Hope Centre" } }
 *   The charge is confirmed by Flutterwave's server-side callback —
 *   wire it to /api/payments/card/callback in the dashboard.
 *
 * Without FLUTTERWAVE_SECRET_KEY a labelled simulation runs and the
 * donation is confirmed through the same server-side confirmation
 * path as the mobile-money providers.
 */

export interface CardInitResult {
  ok: boolean;
  providerRef?: string;
  simulation: boolean;
  error?: string;
}

export function isCardConfigured(): boolean {
  return Boolean(process.env.FLUTTERWAVE_SECRET_KEY);
}

export async function initiateCardCharge(params: {
  amountKes: number;
  reference: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
}): Promise<CardInitResult> {
  if (!isCardConfigured()) {
    const providerRef = `SIM-CARD-${Date.now().toString(36).toUpperCase()}`;
    console.log(
      `[flutterwave:STUB] card charge of KES ${params.amountKes} (ref ${params.reference}) — configure FLUTTERWAVE_SECRET_KEY for live card payments`,
    );
    return { ok: true, providerRef, simulation: true };
  }

  try {
    const res = await fetch("https://api.flutterwave.com/v3/charges", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: params.amountKes,
        currency: "KES",
        txRef: params.reference,
        callbackUrl: process.env.CARD_CALLBACK_URL || "",
        customer: {
          name: params.donorName,
          email: params.donorEmail,
          phone: params.donorPhone,
        },
        customizations: { title: "IK Hope Centre", description: "Donation" },
      }),
      signal: AbortSignal.timeout(20_000),
    });
    const data = (await res.json()) as { status?: string; data?: { id?: number } };
    if (data.status === "success" && data.data?.id) {
      return { ok: true, providerRef: String(data.data.id), simulation: false };
    }
    return { ok: false, simulation: false, error: "Card payment could not be started." };
  } catch (e) {
    console.error("[flutterwave] init failed:", (e as Error).message);
    return {
      ok: false,
      simulation: false,
      error: "Card gateway unavailable right now. Please use M-PESA or Airtel Money.",
    };
  }
}
