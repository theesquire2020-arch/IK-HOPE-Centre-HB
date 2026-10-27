/** Input sanitization helpers — every external value passes through these. */

export function cleanText(input: unknown, max = 500): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/</g, "(")
    .replace(/>/g, ")")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function cleanEmail(input: unknown): string {
  const v = cleanText(input, 254).toLowerCase().replace(/[()]/g, "");
  if (!v) return "";
  return /^[\w.+-]+@[\w-]+(\.[\w-]+)*\.[a-z]{2,}$/.test(v) ? v : "";
}

/** Normalize a Kenyan phone to the STK Push format 2547XXXXXXXX. */
export function normalizeKenyaPhone(input: unknown): string {
  if (typeof input !== "string") return "";
  let d = input.replace(/[^\d]/g, "");
  if (d.startsWith("254")) {
    // as-is
  } else if (d.startsWith("0")) {
    d = "254" + d.slice(1);
  } else if (d.startsWith("7") || d.startsWith("1")) {
    d = "254" + d;
  }
  return /^254(7|1)\d{8}$/.test(d) ? d : "";
}

/** 254712345678 -> 0712 345 678 for display */
export function displayPhone(p: string | null | undefined): string {
  if (!p) return "";
  const n = p.startsWith("254") ? "0" + p.slice(3) : p;
  return n.replace(/(\d{4})(\d{3})(\d{3})$/, "$1 $2 $3");
}

/** Valid positive amount, 1..1,000,000 in the chosen currency, 2dp. */
export function cleanAmount(input: unknown): number | null {
  const v =
    typeof input === "number" ? input : Number.parseFloat(String(input ?? ""));
  if (!Number.isFinite(v)) return null;
  if (v < 1 || v > 1_000_000) return null;
  return Math.round(v * 100) / 100;
}

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "campaign"
  );
}
