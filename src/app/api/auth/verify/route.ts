import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  PENDING_COOKIE,
  createSession,
  setSessionCookie,
  verifyPendingToken,
  verifyRecoveryCode,
  verifyTotp,
} from "@/lib/auth";
import { cleanText } from "@/lib/sanitize";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Step 2: TOTP code (or recovery code) -> real session. */
export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`totp:${ip}`, 8, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  }

  const c = await cookies();
  const pending = verifyPendingToken(c.get(PENDING_COOKIE)?.value);
  if (!pending) {
    return NextResponse.json(
      { error: "Session expired — please log in again." },
      { status: 401 },
    );
  }

  const rows = await db.select().from(admins).where(eq(admins.id, pending.adminId)).limit(1);
  const admin = rows[0];
  if (!admin) {
    return NextResponse.json({ error: "Account not found." }, { status: 401 });
  }

  let data: { code?: string };
  try {
    data = (await req.json()) as typeof data;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const code = cleanText(data.code ?? "", 32);

  const ok = verifyTotp(admin.totpSecret, code) || verifyRecoveryCode(code);
  if (!ok) {
    return NextResponse.json(
      { error: "Invalid authentication code. Check your authenticator app." },
      { status: 401 },
    );
  }

  const token = await createSession(
    admin.id,
    ip,
    (req.headers.get("user-agent") || "").slice(0, 200),
  );
  await setSessionCookie(token);
  c.delete(PENDING_COOKIE);

  return NextResponse.json({ ok: true, redirect: "/admin" });
}
