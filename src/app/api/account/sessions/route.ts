import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { hashSessionToken, getClientIp } from "@/lib/auth-session";
import { tooManyRequests, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();
  const sessions = await prisma.authSession.findMany({
    where: { userId: session.user.id },
    orderBy: { lastSeenAt: "desc" },
    take: 50,
    select: {
      id: true,
      createdAt: true,
      lastSeenAt: true,
      revokedAt: true,
      ip: true,
      userAgent: true,
      sessionTokenHash: true,
    },
  });
  const currentHash = hashSessionToken(session.user.sessionId);
  return NextResponse.json(
    sessions.map((s) => ({
      id: s.id,
      createdAt: s.createdAt.toISOString(),
      lastSeenAt: s.lastSeenAt.toISOString(),
      revokedAt: s.revokedAt?.toISOString() ?? null,
      ip: s.ip,
      userAgent: s.userAgent,
      isCurrent: s.sessionTokenHash === currentHash,
    }))
  );
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();
  const rl = rateLimit({
    key: `api:account:sessions:delete:${session.user.id}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(undefined, rl.retryAfterSeconds);

  const currentHash = hashSessionToken(session.user.sessionId);
  const now = new Date();
  const res = await prisma.authSession.updateMany({
    where: { userId: session.user.id, revokedAt: null, NOT: { sessionTokenHash: currentHash } },
    data: { revokedAt: now },
  });

  if (res.count === 0) {
    // Not an error; just nothing to revoke.
    return NextResponse.json({ ok: true, revoked: 0 });
  }

  const ip = getClientIp(request.headers);
  const userAgent = request.headers.get("user-agent");
  await prisma.authEvent.create({
    data: {
      userId: session.user.id,
      type: "SIGN_OUT_ALL",
      ip,
      userAgent,
      meta: { revoked: res.count },
    },
  });
  return NextResponse.json({ ok: true, revoked: res.count });
}

