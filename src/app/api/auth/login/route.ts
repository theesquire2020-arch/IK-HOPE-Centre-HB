import { NextResponse } from "next/server";
import {
  checkPassword,
  findAdminByEmail,
  makePendingToken,
  setPendingCookie,
} from "@/lib/auth";
import { cleanEmail, cleanText } from "@/lib/sanitize";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Step 1: email + bcrypt password -> short-lived pending cookie. */
export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`login:${ip}`, 6, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  }

  let data: { email?: string; password?: string };
  try {
    data = (await req.json()) as typeof data;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = cleanEmail(data.email ?? "");
  const password = typeof data.password === "string" ? cleanText(data.password, 200) : "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const admin = await findAdminByEmail(email);
  const ok = admin ? await checkPassword(admin.passwordHash, password) : false;
  if (!ok || !admin) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  await setPendingCookie(makePendingToken(admin.id));
  return NextResponse.json({ ok: true, stage: "totp" });
}
