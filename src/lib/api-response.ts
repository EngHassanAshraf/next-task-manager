import { NextResponse } from "next/server";

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function tooManyRequests(message = "Too many requests", retryAfterSeconds?: number) {
  const res = NextResponse.json({ error: message }, { status: 429 });
  if (retryAfterSeconds) {
    res.headers.set("Retry-After", String(retryAfterSeconds));
  }
  return res;
}

export function serverError(message: string) {
  return NextResponse.json({ error: message }, { status: 500 });
}
