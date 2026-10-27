import { NextResponse } from "next/server";
import { getRates, getRatesSource } from "@/lib/rates";

export const dynamic = "force-dynamic";

/** Live KES-based FX rates (cached 5 min server-side). */
export async function GET() {
  const rates = await getRates();
  return NextResponse.json({
    base: "KES",
    rates,
    source: getRatesSource(),
    ts: Date.now(),
  });
}
