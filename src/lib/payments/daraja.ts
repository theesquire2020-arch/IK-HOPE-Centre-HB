/**
 * M-PESA via Safaricom Daraja (STK Push).
 *
 * SANDBOX:  https://sandbox.safaricom.co.ke
 * PRODUCTION: https://api.safaricom.co.ke
 *
 * When DARAJA_KEY / DARAJA_SECRET / DARAJA_PASSKEY / DARAJA_SHORTCODE
 * are present in env, REAL API calls are made. Otherwise a clearly
 * labelled simulation runs so the full flow (init -> callback ->
 * confirm -> receipt) works end-to-end in development.
 *
 * SECURITY: payments are confirmed ONLY by the server-to-server
 * callback endpoint (/api/payments/daraja/callback), never by the
 * browser.
 */

export interface InitResult {
  ok: boolean;
  providerRef?: string;
  simulation: boolean;
  error?: string;
}

function cfg() {
  return {
    key: process.env.DARAJA_KEY || "",
    secret: process.env.DARAJA_SECRET || "",
    passkey: process.env.DARAJA_PASSKEY || "",
    shortcode: process.env.DARAJA_SHORTCODE || "",
    callbackUrl: process.env.DARAJA_CALLBACK_URL || "",
    base:
      process.env.DARAJA_BASE_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke"),
  };
}

export function isDarajaConfigured(): boolean {
  const c = cfg();
  try {
    const productionReady =
      process.env.NODE_ENV !== "production" ||
      (new URL(c.base).hostname === "api.safaricom.co.ke" &&
        Boolean(process.env.DARAJA_CALLBACK_TOKEN));
    return Boolean(
      productionReady &&
      c.key &&
        c.secret &&
        c.passkey &&
        c.shortcode &&
        new URL(c.callbackUrl).protocol === "https:",
    );
  } catch {
    return false;
  }
}

function darajaTimestamp(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}${part("month")}${part("day")}${part("hour")}${part("minute")}${part("second")}`;
}

export async function initiateMpesa(params: {
  phone: string; // 2547XXXXXXXX
  amountKes: number;
  reference: string; // receipt code
  description: string;
}): Promise<InitResult> {
  const c = cfg();

  if (!isDarajaConfigured()) {
    if (process.env.NODE_ENV === "production") {
      return {
        ok: false,
        simulation: false,
        error: "M-PESA payments are not configured. Please try another method.",
      };
    }
    const providerRef = `SIM-MPESA-${Date.now().toString(36).toUpperCase()}`;
    console.log(
      `[daraja:STUB] STK Push to ${params.phone} for KES ${params.amountKes} (ref ${params.reference}) — configure DARAJA_* env vars for live payments`,
    );
    return { ok: true, providerRef, simulation: true };
  }

  try {
    // LIVE step 1: client-credentials OAuth token
    const auth = Buffer.from(`${c.key}:${c.secret}`).toString("base64");
    const tokenRes = await fetch(
      `${c.base}/oauth/v1/generate?grant_type=client_credentials`,
      {
        method: "GET",
        headers: { Authorization: `Basic ${auth}` },
        signal: AbortSignal.timeout(20_000),
      },
    );
    if (!tokenRes.ok) throw new Error(`daraja oauth ${tokenRes.status}`);
    const { access_token } = (await tokenRes.json()) as { access_token: string };

    // LIVE step 2: CheckoutRequestPassword = base64(Passkey + yyyymmddHHMMss)
    const ts = darajaTimestamp();
    const password = Buffer.from(`${c.passkey}${ts}`).toString("base64");

    // LIVE step 3: trigger the STK push
    const pushRes = await fetch(`${c.base}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: c.shortcode,
        Password: password,
        Timestamp: ts,
        TransactionType: "CustomerPayBillOnline",
        Amount: params.amountKes,
        PartyA: params.phone,
        PartyB: c.shortcode,
        PhoneNumber: params.phone,
        CallBackURL: c.callbackUrl,
        AccountReference: "IKHOPE",
        TransactionDesc: params.description.slice(0, 13),
      }),
      signal: AbortSignal.timeout(20_000),
    });
    const data = (await pushRes.json()) as {
      ResponseCode?: string;
      ResponseDescription?: string;
      CheckoutRequestID?: string;
    };
    if (data.ResponseCode === "0" && data.CheckoutRequestID) {
      return { ok: true, providerRef: data.CheckoutRequestID, simulation: false };
    }
    return {
      ok: false,
      simulation: false,
      error: data.ResponseDescription || "STK push was rejected by Safaricom.",
    };
  } catch (e) {
    console.error("[daraja] init failed:", (e as Error).message);
    return {
      ok: false,
      simulation: false,
      error: "Could not reach Safaricom right now. Please try again.",
    };
  }
}

/**
 * Parse + validate Daraja's server-to-server result callback.
 * LIVE deployments should additionally POST the CallbackData token to
 * `${base}/mpesa/stkpush/v1/query` to authenticate the sender before
 * trusting ResultCode (Daraja supports token-based callback auth).
 */
export function parseDarajaCallback(body: unknown): {
  ok: boolean;
  resultCode: number;
  checkoutRequestId?: string;
  mpesaRef?: string;
  error?: string;
} {
  const b = body as {
    Body?: {
      StkCallback?: {
        ResultCode?: number;
        ResultDesc?: string;
        CheckoutRequestID?: string;
        CallbackMetadata?: { Item?: { Name: string; Value: string }[] };
      };
    };
  };
  const callback = b?.Body?.StkCallback;
  const items = callback?.CallbackMetadata?.Item ?? [];
  const get = (n: string) => items.find((i) => i.Name === n)?.Value;
  const resultCode = Number(callback?.ResultCode);
  const mpesaRef = get("MpesaReceiptNumber");
  if (Number.isFinite(resultCode) && resultCode === 0) {
    return {
      ok: true,
      resultCode,
      checkoutRequestId: callback?.CheckoutRequestID,
      mpesaRef,
    };
  }
  return {
    ok: false,
    resultCode,
    checkoutRequestId: callback?.CheckoutRequestID,
    mpesaRef,
    error: callback?.ResultDesc || `M-PESA declined (code ${resultCode})`,
  };
}
