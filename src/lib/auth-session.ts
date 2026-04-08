import { createHash, randomUUID } from "node:crypto";

export function newSessionId(): string {
  return randomUUID();
}

export function hashSessionToken(sessionId: string): string {
  return createHash("sha256").update(sessionId).digest("hex");
}

function getHeader(headers: Headers | Record<string, string> | undefined, key: string): string | null {
  if (!headers) return null;
  if (headers instanceof Headers) return headers.get(key);
  const lower = key.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === lower) return v;
  }
  return null;
}

export function getClientIp(headers: Headers | Record<string, string> | undefined): string | null {
  const xf = getHeader(headers, "x-forwarded-for");
  if (xf) {
    // Take the first IP in the list.
    return xf.split(",")[0]?.trim() ?? null;
  }
  const xr = getHeader(headers, "x-real-ip");
  return xr?.trim() || null;
}

