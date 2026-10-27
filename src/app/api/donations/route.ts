import { NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns, donations } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  cleanAmount,
  cleanEmail,
  cleanText,
  normalizeKenyaPhone,
} from "@/lib/sanitize";
import { convertToKes, getRates, isCurrency } from "@/lib/rates";
import { recordTx, simulateProviderCallback, failDonation } from "@/lib/donations";
import { initiateMpesa } from "@/lib/payments/daraja";
import { initiateAirtelCollect } from "@/lib/payments/airtel";
import { initiateCardCharge } from "@/lib/payments/card";
import { sendReceipt } from "@/lib/receipt";

export const dynamic = "force-dynamic";

function receiptCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  const bytes = randomBytes(8);
  for (const b of bytes) s += alphabet[b % alphabet.length];
  return `IKH-${s.slice(0, 4)}-${s.slice(4)}`;
}

const PROVIDER: Record<string, string> = {
  mpesa: "daraja",
  airtel: "airtel",
  card: "flutterwave",
  bank: "bank",
};

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`donate:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  /* ---------------- parse (JSON or multipart with proof file) ---------- */
  let data: Record<string, string> = {};
  let file: File | null = null;
  try {
    if ((req.headers.get("content-type") || "").includes("multipart/form-data")) {
      const fd = await req.formData();
      const f = fd.get("proof");
      if (f instanceof File && f.size > 0) file = f;
      for (const [k, v] of fd.entries()) {
        if (typeof v === "string") data[k] = v;
      }
    } else {
      const json = (await req.json()) as Record<string, unknown>;
      data = JSON.parse(JSON.stringify(json)) as Record<string, string>;
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  /* ---------------- validate + sanitize ------------------------------ */
  const method = String(data.method ?? "");
  if (!["mpesa", "airtel", "bank", "card"].includes(method)) {
    return NextResponse.json({ error: "Choose a payment method." }, { status: 400 });
  }
  const currency = data.currency as "KES";
  if (!isCurrency(currency)) {
    return NextResponse.json({ error: "Invalid currency." }, { status: 400 });
  }
  const amount = cleanAmount(data.amount);
  if (amount === null) {
    return NextResponse.json(
      { error: "Enter a valid amount between 1 and 1,000,000." },
      { status: 400 },
    );
  }
  const donorName = cleanText(data.donorName, 80);
  if (donorName.length < 2) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  }
  const donorEmail = cleanEmail(data.donorEmail) || null;
  const donorPhone = normalizeKenyaPhone(data.donorPhone) || null;
  if ((method === "mpesa" || method === "airtel") && !donorPhone) {
    return NextResponse.json(
      { error: "Enter a valid Kenyan phone number for the payment prompt (e.g. 0712 345 678)." },
      { status: 400 },
    );
  }
  const message = cleanText(data.message, 280) || null;
  const transferRef = cleanText(data.transferRef, 60).toUpperCase() || null;
  if (method === "bank" && !transferRef) {
    return NextResponse.json(
      { error: "Enter the bank reference / transaction ID from your transfer receipt." },
      { status: 400 },
    );
  }

  let campaignId: number | null = null;
  if (data.campaignSlug) {
    const rows = await db
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(and(eq(campaigns.slug, data.campaignSlug), eq(campaigns.status, "approved")))
      .limit(1);
    campaignId = rows[0]?.id ?? null;
  }

  /* ---------------- proof upload (bank) ------------------------------ */
  let proofPath: string | null = null;
  let proofMime = "";
  if (method === "bank") {
    if (!file) {
      return NextResponse.json(
        { error: "Please upload proof of transfer (screenshot or PDF)." },
        { status: 400 },
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Proof file must be under 5 MB." }, { status: 400 });
    }
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!["jpg", "jpeg", "png", "webp", "pdf"].includes(ext)) {
      return NextResponse.json(
        { error: "Proof must be a JPG, PNG, WEBP or PDF." },
        { status: 400 },
      );
    }
    const code = receiptCode();
    const dir = path.join(process.cwd(), "uploads", "proofs");
    await mkdir(dir, { recursive: true });
    const fname = `${code}_${Date.now()}.${ext}`;
    await writeFile(path.join(dir, fname), Buffer.from(await file.arrayBuffer()));
    proofPath = `proofs/${fname}`;
    proofMime = file.type || "";
  }

  /* ---------------- FX snapshot (server-side is the source of truth) -- */
  const rates = await getRates();
  const amountKes = convertToKes(amount, currency, rates);
  if (amountKes < 10) {
    return NextResponse.json(
      { error: "The minimum donation is KES 10." },
      { status: 400 },
    );
  }
  const rc = receiptCode();

  /* ---------------- create the donation ------------------------------ */
  const [row] = await db
    .insert(donations)
    .values({
      receiptCode: rc,
      campaignId,
      donorName,
      donorEmail,
      donorPhone: donorPhone || null,
      amountOriginal: String(amount),
      currency,
      amountKes,
      rateUsed: String(rates[currency] ?? 1),
      method,
      status: method === "bank" ? "bank_pending" : "pending",
      transferRef,
      message,
      proofPath,
      createdAt: new Date(),
    })
    .returning();

  const provider = PROVIDER[method];
  await recordTx(row.id, provider, "init", "initiated", `KES ${amountKes} (${amount} ${currency})`);

  /* ---------------- bank: await admin verification -------------------- */
  if (method === "bank") {
    try {
      await sendReceipt({
        receiptCode: rc,
        donorName,
        donorEmail,
        donorPhone: donorPhone,
        amountOriginal: String(amount),
        currency,
        amountKes,
        method: "bank",
        status: "bank_pending",
        campaignTitle: null,
        providerRef: null,
        createdAt: row.createdAt,
      });
    } catch (e) {
      console.error("[receipt]", (e as Error).message);
    }
    return NextResponse.json({
      receiptCode: rc,
      status: "bank_pending",
      simulation: false,
      proofMime,
      message:
        "Transfer recorded. Our team verifies bank transfers within 24 hours; the gift counts toward the goal once confirmed.",
    });
  }

  /* ---------------- mobile money / card: initiate provider ------------ */
  let init: { ok: boolean; providerRef?: string; simulation: boolean; error?: string };
  const desc = "IK Hope gift";
  if (method === "mpesa") {
    init = await initiateMpesa({ phone: donorPhone!, amountKes, reference: rc, description: desc });
  } else if (method === "airtel") {
    init = await initiateAirtelCollect({
      phone: donorPhone!,
      amountKes,
      reference: rc,
      donorName,
    });
  } else {
    init = await initiateCardCharge({
      amountKes,
      reference: rc,
      donorName,
      donorEmail: donorEmail || undefined,
      donorPhone: donorPhone || undefined,
    });
  }

  if (!init.ok) {
    await failDonation(row.id, provider, init.error || "provider rejected");
    return NextResponse.json({ error: init.error }, { status: 400 });
  }

  await db
    .update(donations)
    .set({ providerRef: init.providerRef ?? undefined })
    .where(eq(donations.id, row.id));

  /* In stub mode the provider callback is simulated; LIVE mode is driven
   * exclusively by the callback endpoints (server-side verification). */
  if (init.simulation) {
    simulateProviderCallback(row.id, provider, init.providerRef ?? rc);
  }

  return NextResponse.json({
    receiptCode: rc,
    status: "pending",
    simulation: init.simulation,
    amountKes,
    message:
      method === "card"
        ? "Card checkout opened (test mode). Confirming…"
        : `Payment prompt sent to ${donorPhone!.replace(/^254/, "0")}. Approve it with your PIN.`,
  });
}
