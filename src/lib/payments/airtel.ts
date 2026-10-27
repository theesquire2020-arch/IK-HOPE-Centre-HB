/**
 * Airtel Money via the Airtel Africa (Transact Africa) API.
 *
 * LIVE endpoint: POST https://api.transact.africa/v2/payments/request
 *   Headers: X-API-KEY, X-USERNAME, X-PASSWORD
 *   Body:    { amount, currency: "KES", type: "collect",
 *              description, externalId, customer: { phone, name } }
 *   The Airtel Money prompt is shown on the customer's handset;
 *   settlement is confirmed via the configured WEBHOOK (server-side),
 *   which is mapped onto /api/payments/airtel/callback here.
 *
 * When AIRTEL_* env vars are absent a labelled simulation runs.
 */

export interface AirtelInitResult {
  ok: boolean;
  providerRef?: string;
  simulation: boolean;
  error?: string;
}

function cfg() {
  return {
    apiKey: process.env.AIRTEL_API_KEY || "",
    username: process.env.AIRTEL_USERNAME || "",
    password: process.env.AIRTEL_PASSWORD || "",
    base: process.env.AIRTEL_BASE_URL || "https://api.transact.africa/v2",
  };
}

export function isAirtelConfigured(): boolean {
  const c = cfg();
  return Boolean(c.apiKey && c.username && c.password);
}

export async function initiateAirtelCollect(params: {
  phone: string; // 2547XXXXXXXX
  amountKes: number;
  reference: string;
  donorName: string;
}): Promise<AirtelInitResult> {
  const c = cfg();

  if (!isAirtelConfigured()) {
    const providerRef = `SIM-ATEL-${Date.now().toString(36).toUpperCase()}`;
    console.log(
      `[airtel:STUB] Airtel Money collect to ${params.phone} for KES ${params.amountKes} (ref ${params.reference}) — configure AIRTEL_* env vars for live payments`,
    );
    return { ok: true, providerRef, simulation: true };
  }

  try {
    const res = await fetch(`${c.base}/payments/request`, {
      method: "POST",
      headers: {
        "X-API-KEY": c.apiKey,
        "X-USERNAME": c.username,
        "X-PASSWORD": c.password,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: params.amountKes,
        currency: "KES",
        type: "collect",
        description: `IK Hope Centre ${params.reference}`,
        externalId: params.reference,
        customer: {
          phone: params.phone,
          name: params.donorName.slice(0, 80) || "Donor",
        },
      }),
      signal: AbortSignal.timeout(20_000),
    });
    const data = (await res.json()) as {
      id?: string;
      status?: string;
      message?: string;
    };
    if (res.ok && data.id) {
      return { ok: true, providerRef: data.id, simulation: false };
    }
    return { ok: false, simulation: false, error: data.message || "Airtel request failed." };
  } catch (e) {
    console.error("[airtel] init failed:", (e as Error).message);
    return {
      ok: false,
      simulation: false,
      error: "Could not reach Airtel Money right now. Please try again.",
    };
  }
}

/** Validate the Airtel webhook payload (server-side, never the browser). */
export function parseAirtelCallback(body: unknown): {
  ok: boolean;
  externalId?: string;
  status?: string;
} {
  const b = body as { type?: string; status?: string; externalId?: string };
  if (b?.type !== "payment" || !b?.externalId) return { ok: false };
  return { ok: true, externalId: b.externalId, status: b.status };
}
