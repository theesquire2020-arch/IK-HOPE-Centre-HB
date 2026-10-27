import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Best-effort visitor country for currency auto-detection. */
export async function GET() {
  try {
    const res = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`geo ${res.status}`);
    const data = (await res.json()) as { country?: string };
    if (!data.country) throw new Error("no country");
    return NextResponse.json({ country: data.country.toUpperCase() });
  } catch {
    return NextResponse.json({ country: "KE" });
  }
}
