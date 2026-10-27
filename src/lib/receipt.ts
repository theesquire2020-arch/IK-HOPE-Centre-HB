import nodemailer from "nodemailer";
import { fmtKES, fmtIn } from "@/lib/format";
import { getRates } from "@/lib/rates";

export interface ReceiptData {
  receiptCode: string;
  donorName: string;
  donorEmail: string | null;
  donorPhone: string | null;
  amountOriginal: string;
  currency: string;
  amountKes: number;
  method: string;
  status: string;
  campaignTitle: string | null;
  providerRef: string | null;
  createdAt: Date;
}

const methodLabel: Record<string, string> = {
  mpesa: "M-PESA",
  airtel: "Airtel Money",
  bank: "Bank transfer",
  card: "Card",
};

export function receiptHtml(d: ReceiptData): string {
  const rates = getRatesSyncSafe();
  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #EAE2CE;border-radius:12px;overflow:hidden">
    <div style="background:#103824;color:#FBF8F1;padding:24px">
      <div style="font-size:14px;letter-spacing:.08em;color:#F5C452">IK HOPE CENTRE ORPHANAGE</div>
      <div style="font-size:22px;font-weight:bold;margin-top:4px">
        ${d.status === "confirmed" ? "Thank you for your gift" : "Donation received"}
      </div>
    </div>
    <div style="padding:24px;color:#1E2B22">
      <p>Dear ${d.donorName},</p>
      <p>
        We ${d.status === "confirmed" ? "have received and confirmed" : "have recorded"}
        your ${d.status === "confirmed" ? "generous" : "generous (pending verification)"} gift of
        <strong>${d.amountOriginal} ${d.currency}</strong>
        (≈ ${fmtKES(d.amountKes)}${rates && d.currency !== "KES" ? ` · ${fmtIn(d.currency, d.amountKes, rates)}` : ""})
        ${d.campaignTitle ? `for <strong>${d.campaignTitle}</strong>` : "to support the children in our care"}.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
        ${row("Receipt No.", d.receiptCode)}
        ${row("Date", d.createdAt.toLocaleString("en-KE"))}
        ${row("Method", methodLabel[d.method] || d.method)}
        ${row("Status", d.status)}
        ${d.providerRef ? row("Provider reference", d.providerRef) : ""}
      </table>
      <p style="font-size:12px;color:#48584E">
        IK Hope Centre Orphanage · Reg. No. 000-NGC-2358 (National Registration Bureau) ·
        KRA Exemption 200/0012345 · Nairobi, Kenya.<br/>
        100% of confirmed donations go to the children's care and programs.
        This is a computer-generated receipt — no signature required.
      </p>
    </div>
  </div>`;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 12px;border-bottom:1px solid #EFE9DA;background:#FBF8F1;color:#48584E">${label}</td><td style="padding:6px 12px;border-bottom:1px solid #EFE9DA;font-weight:bold">${value}</td></tr>`;
}

let ratesCache: Record<string, number> | null = null;
function getRatesSyncSafe(): Record<string, number> | null {
  if (ratesCache) return ratesCache;
  void getRates().then((r) => {
    ratesCache = r;
  });
  return null;
}

/** Email the receipt when SMTP is configured; otherwise log it (stub). */
export async function sendReceipt(d: ReceiptData): Promise<void> {
  if (!d.donorEmail) return;
  const subject =
    d.status === "confirmed"
      ? `Your gift to IK Hope Centre — Receipt ${d.receiptCode}`
      : `We received your bank transfer — ${d.receiptCode}`;

  const host = process.env.SMTP_HOST;
  if (!host) {
    console.log(`[receipt] SMTP not configured — email receipt for ${d.receiptCode} skipped (logged only)`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "IK Hope Centre <receipts@ikhope.org>",
    to: d.donorEmail,
    subject,
    html: receiptHtml(d),
  });
  // LIVE SMS: send the same summary to d.donorPhone via Africa's Talking /
  // Twilio here (kept out of the default build to avoid extra secrets).
}

/** Personal thank-you from the team (admin-triggered). */
export async function sendThankYou(
  email: string,
  name: string,
  note: string,
  receiptCode: string,
): Promise<void> {
  const host = process.env.SMTP_HOST;
  const subject = `A thank-you from the children at IK Hope Centre (${receiptCode})`;
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #EAE2CE;border-radius:12px;overflow:hidden">
    <div style="background:#103824;color:#FBF8F1;padding:24px">
      <div style="font-size:14px;letter-spacing:.08em;color:#F5C452">IK HOPE CENTRE</div>
      <div style="font-size:22px;font-weight:bold;margin-top:4px">Asante sana, ${name}.</div>
    </div>
    <div style="padding:24px;color:#1E2B22">
      <p>${note}</p>
      <p style="font-size:12px;color:#48584E">
        With gratitude,<br/>The IK Hope Centre team<br/>
        Reg. No. 000-NGC-2358 · Nairobi, Kenya
      </p>
    </div>
  </div>`;
  if (!host) {
    console.log(`[thankyou] SMTP not configured — message for ${email} logged only`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER || "", pass: process.env.SMTP_PASS || "" },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "IK Hope Centre <hello@ikhope.org>",
    to: email,
    subject,
    html,
  });
}
