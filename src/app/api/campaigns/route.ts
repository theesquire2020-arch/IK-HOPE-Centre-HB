import { NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns, donations } from "@/db/schema";
import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { cleanEmail, cleanText, normalizeKenyaPhone, slugify } from "@/lib/sanitize";
import { cleanAmount } from "@/lib/sanitize";
import { convertToKes, getRates, isCurrency } from "@/lib/rates";
import { listApprovedCampaigns } from "@/lib/campaigns";

export const dynamic = "force-dynamic";

/** Public: approved campaigns with aggregate raised totals only. */
export async function GET() {
  const rows = await listApprovedCampaigns();
  return NextResponse.json(
    rows.map((c) => ({
      slug: c.slug,
      title: c.title,
      targetKes: c.targetKes,
      raisedKes: c.raisedKes,
      image: c.image,
    })),
  );
}

/** Public: create a fundraiser (published after admin approval). */
export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`campaign:${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "You can create up to 3 campaigns per hour. Email us for more." },
      { status: 429 },
    );
  }

  let data: Record<string, unknown>;
  try {
    data = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ownerName = cleanText(data.ownerName, 80);
  const ownerEmail = cleanEmail(data.ownerEmail);
  const ownerPhone = normalizeKenyaPhone(data.ownerPhone) || null;
  const title = cleanText(data.title, 100);
  const description = cleanText(data.description, 1200);
  const currency = isCurrency(data.currency) ? data.currency : "KES";
  const targetOriginal = cleanAmount(data.target);

  if (ownerName.length < 2) return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  if (!ownerEmail) return NextResponse.json({ error: "Enter a valid email — we send your campaign link here." }, { status: 400 });
  if (title.length < 8) return NextResponse.json({ error: "Campaign title must be at least 8 characters." }, { status: 400 });
  if (description.length < 40) return NextResponse.json({ error: "Tell people why — description must be at least 40 characters." }, { status: 400 });
  if (targetOriginal === null) return NextResponse.json({ error: "Enter a valid goal amount." }, { status: 400 });

  const rates = await getRates();
  const targetKes = convertToKes(targetOriginal, currency, rates);
  if (targetKes < 1000) {
    return NextResponse.json(
      { error: "The minimum campaign goal is KES 1,000." },
      { status: 400 },
    );
  }

  /* Basic policy screen: no child identities, no prohibited content */
  const lower = `${title} ${description}`.toLowerCase();
  const banned = ["drugs", "weapon", "gambl", "casino", "poker", "porn", "gambling"];
  if (banned.some((b) => lower.includes(b))) {
    return NextResponse.json(
      { error: "Campaigns must be about charitable causes. Please revise the content." },
      { status: 400 },
    );
  }

  const base = slugify(title);
  const slug = `${base}-${Date.now().toString(36)}`;

  const [row] = await db
    .insert(campaigns)
    .values({
      slug,
      title,
      description,
      targetKes,
      status: "pending",
      ownerName,
      ownerEmail,
      ownerPhone,
      image: "/images/facility.jpg",
    })
    .returning();

  return NextResponse.json(
    {
      ok: true,
      slug: row.slug,
      status: row.status,
      message:
        "Campaign submitted for review. Our team approves most campaigns within 24 hours — your public page goes live at /campaigns/" +
        row.slug +
        " and we'll email you the share link.",
    },
    { status: 201 },
  );
}
