/**
 * Parses a string query param as a positive integer.
 * Returns `fallback` if the value is missing, non-numeric, or out of range.
 */
export function parsePositiveInt(
  v: string | undefined,
  fallback: number,
  max = 200
): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
}
