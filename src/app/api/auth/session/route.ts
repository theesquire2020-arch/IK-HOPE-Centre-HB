import { NextResponse } from "next/server";
import { getSessionAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await getSessionAdmin();
  if (!s) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({
    admin: {
      id: s.admin.id,
      email: s.admin.email,
      name: s.admin.name,
      role: s.admin.role,
    },
    expiresAt: s.expiresAt,
  });
}
