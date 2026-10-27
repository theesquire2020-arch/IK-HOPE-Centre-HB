/**
 * Admin authentication: email + bcrypt password (step 1), TOTP 2FA
 * (step 2, with one-time recovery code fallback), DB-backed session
 * tokens with a short TTL, rate limiting (applied in routes) and
 * same-origin (CSRF) checks for state-changing admin requests.
 */
import { cookies } from "next/headers";
import { db } from "@/db";
import { admins, sessions } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "ikhc_admin_session";
export const PENDING_COOKIE = "ikhc_admin_pending";

const isProd = process.env.NODE_ENV === "production";
export const SESSION_TTL_MIN = Number(process.env.SESSION_TTL_MINUTES || 30);
const PENDING_TTL_MIN = 10;

const hmacSecret = () => {
  const secret = process.env.ADMIN_HMAC_SECRET;
  if (isProd && (!secret || secret.length < 32)) {
    throw new Error("ADMIN_HMAC_SECRET must be at least 32 characters in production");
  }
  return secret || "dev-admin-hmac-change-me";
};

function sign(payload: string): string {
  return createHmac("sha256", hmacSecret()).update(payload).digest("hex");
}

/* ---------- Step 1 -> step 2 hand-off (10 min, HMAC signed) ---------- */

export function makePendingToken(adminId: number): string {
  const exp = Date.now() + PENDING_TTL_MIN * 60_000;
  const base = `${adminId}:${exp}`;
  return `${base}:${sign(base)}`;
}

export function verifyPendingToken(
  token: string | undefined,
): { adminId: number } | null {
  if (!token) return null;
  const parts = token.split(":");
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts;
  if (!Number.isInteger(Number(id)) || Number(exp) < Date.now()) return null;
  const expected = sign(`${id}:${exp}`);
  try {
    if (
      sig.length !== expected.length ||
      !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    )
      return null;
  } catch {
    return null;
  }
  return { adminId: Number(id) };
}

/* ---------- TOTP (2FA) — RFC 6238, implemented with node:crypto ---------- */

const B32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Decode(s: string): Buffer {
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const ch of s.toUpperCase().replace(/[\s=]/g, "")) {
    const idx = B32_ALPHABET.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 0xff);
    }
  }
  return Buffer.from(bytes);
}

function hotp(secret: Buffer, counter: bigint): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(counter);
  const h = createHmac("sha1", secret).update(msg).digest();
  const offset = h[h.length - 1] & 0x0f;
  const code =
    ((h[offset] & 0x7f) << 24) |
    (h[offset + 1] << 16) |
    (h[offset + 2] << 8) |
    h[offset + 3];
  return String(code % 1_000_000).padStart(6, "0");
}

export function verifyTotp(secretB32: string, token: string): boolean {
  const t = token.replace(/\s/g, "");
  if (!/^\d{6}$/.test(t)) return false;
  try {
    const secret = base32Decode(secretB32);
    if (secret.length < 10) return false;
    const step = Math.floor(Date.now() / 30_000);
    for (let w = -1; w <= 1; w++) {
      if (hotp(secret, BigInt(step + w)) === t) return true;
    }
  } catch {
    return false;
  }
  return false;
}

export function verifyRecoveryCode(code: string): boolean {
  const expected = (process.env.ADMIN_RECOVERY_CODE || "").trim().toUpperCase();
  const given = (code || "").trim().toUpperCase();
  if (!expected) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/* ---------- Sessions ---------- */

export async function createSession(
  adminId: number,
  ip: string,
  userAgent: string,
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MIN * 60_000);
  await db.insert(sessions).values({
    token,
    adminId,
    expiresAt,
    ip: ip || null,
    userAgent: (userAgent || "").slice(0, 200) || null,
  });
  return token;
}

export async function getSessionAdmin(): Promise<{
  admin: typeof admins.$inferSelect;
  expiresAt: Date;
} | null> {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);
  if (!rows.length) return null;
  const adminRows = await db
    .select()
    .from(admins)
    .where(eq(admins.id, rows[0].adminId))
    .limit(1);
  if (!adminRows.length) return null;
  return { admin: adminRows[0], expiresAt: rows[0].expiresAt };
}

export async function destroySession(): Promise<void> {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.token, token));
  c.delete(SESSION_COOKIE);
  c.delete(PENDING_COOKIE);
}

export async function setSessionCookie(token: string): Promise<void> {
  const c = await cookies();
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: SESSION_TTL_MIN * 60,
  });
}

export async function setPendingCookie(token: string): Promise<void> {
  const c = await cookies();
  c.set(PENDING_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: PENDING_TTL_MIN * 60,
  });
}

/* ---------- Route guards ---------- */

/** CSRF guard: state-changing admin routes must originate from this host. */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin") || req.headers.get("referer");
  if (!origin) return true; // non-browser clients; brute force covered by rate limits
  try {
    const host = new URL(origin).host;
    const reqHost = req.headers.get("host");
    return reqHost ? host === reqHost : true;
  } catch {
    return false;
  }
}

export async function requireAdmin(req: Request): Promise<
  | { ok: true; admin: typeof admins.$inferSelect }
  | { ok: false; reason: "unauthorized" | "forbidden" | "origin" }
> {
  if (!isSameOrigin(req)) return { ok: false, reason: "origin" };
  const s = await getSessionAdmin();
  if (!s) return { ok: false, reason: "unauthorized" };
  if (s.admin.role !== "admin") return { ok: false, reason: "forbidden" };
  return { ok: true, admin: s.admin };
}

export async function findAdminByEmail(email: string) {
  const rows = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  return rows[0] ?? null;
}

export async function checkPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}
