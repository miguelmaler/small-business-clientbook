/**
 * Money helpers. Job amounts are stored as whole cents (`amount_cents: integer`)
 * because decimals like 0.1 + 0.2 can't be represented exactly in JavaScript
 * (0.1 + 0.2 === 0.30000000000000004). Integers have no rounding errors.
 */

/** $10,000,000.00 — a sanity cap so typos like an extra few zeros are caught. */
export const MAX_AMOUNT_CENTS = 1_000_000_000;

const DOLLAR_PATTERN = /^(\d+)?(?:\.(\d{1,2}))?$/;

/**
 * Convert a dollar amount typed by a user into whole cents.
 * Accepts "12", "12.5", "12.50", "$1,234.56", ".99", or a number like 12.5.
 * Returns null for anything that isn't a valid, non-negative amount with at
 * most 2 decimal places.
 */
export function dollarsToCents(input: string | number): number | null {
  if (typeof input === "number") {
    if (!Number.isFinite(input) || input < 0) return null;
    const cents = Math.round(input * 100);
    // Reject numbers with more than 2 decimals, e.g. 12.345
    if (Math.abs(input * 100 - cents) > 1e-6) return null;
    return cents;
  }

  const cleaned = input.trim().replace(/^\$/, "").replace(/,/g, "");
  const match = DOLLAR_PATTERN.exec(cleaned);
  if (!match || (match[1] === undefined && match[2] === undefined)) return null;

  const whole = Number(match[1] ?? "0");
  const fraction = Number((match[2] ?? "0").padEnd(2, "0"));
  return whole * 100 + fraction;
}

/** 1234 -> "12.34". Useful for pre-filling an edit form. */
export function centsToDollars(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(Math.trunc(cents));
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

/** 123456 -> "$1,234.56". Useful for displaying amounts in the UI. */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
}
