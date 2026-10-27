import { NextResponse } from "next/server";
import { db } from "@/db";
import { donations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};

/** Admin-only: stream a bank transfer proof file (stored outside public/). */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: auth.reason === "unauthorized" ? 401 : 403 },
    );
  }

  const { id } = await params;
  const donationId = Number(id);
  if (!Number.isInteger(donationId) || donationId <= 0) {
    return NextResponse.json({ error: "Bad id." }, { status: 400 });
  }
  const rows = await db.select().from(donations).where(eq(donations.id, donationId)).limit(1);
  const d = rows[0];
  if (!d?.proofPath) return NextResponse.json({ error: "No proof on file." }, { status: 404 });

  const ext = (d.proofPath.split(".").pop() || "").toLowerCase();
  if (!MIME[ext]) return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });

  const abs = path.join(process.cwd(), "uploads", d.proofPath);
  // defense in depth: ensure we stay inside uploads/
  if (!abs.startsWith(path.join(process.cwd(), "uploads"))) {
    return NextResponse.json({ error: "Bad path." }, { status: 400 });
  }
  try {
    const buf = await readFile(abs);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": MIME[ext],
        "Content-Disposition": `inline; filename="${d.receiptCode}_${ext}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing." }, { status: 404 });
  }
}
