import { NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { cleanEmail, cleanText } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many messages. Please email us directly." }, { status: 429 });
  }
  let data: Record<string, unknown>;
  try {
    data = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const name = cleanText(data.name, 80);
  const email = cleanEmail(data.email);
  const subject = cleanText(data.subject, 120) || "General enquiry";
  const message = cleanText(data.message, 2000);
  if (name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!email) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  if (message.length < 10) return NextResponse.json({ error: "Message is too short." }, { status: 400 });

  await db.insert(contactMessages).values({ name, email, subject, message });
  // LIVE: also email the inbox via SMTP here (same credentials as receipts).
  return NextResponse.json({ ok: true, message: "Asante — we've received your message and will reply within two business days." });
}
