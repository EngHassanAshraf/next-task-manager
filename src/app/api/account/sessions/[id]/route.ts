import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { getClientIp, hashSessionToken } from "@/lib/auth-session";
import { badRequest, notFound, tooManyRequests, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();
  const rl = rateLimit({
    key: `api:account:sessions:revoke:${session.user.id}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(undefined, rl.retryAfterSeconds);

  const { id } = await context.params;
  const target = await prisma.authSession.findUnique({
    where: { id },
    select: { id: true, userId: true, revokedAt: true, sessionTokenHash: true },
  });
  if (!target) return notFound();
  if (target.userId !== session.user.id) return badRequest("Cannot revoke another user session.");
  if (target.revokedAt) return NextResponse.json({ ok: true, alreadyRevoked: true });

  const now = new Date();
  await prisma.authSession.update({ where: { id }, data: { revokedAt: now } });

  const ip = getClientIp(request.headers);
  const userAgent = request.headers.get("user-agent");
  await prisma.authEvent.create({
    data: {
      userId: session.user.id,
      type: "SESSION_REVOKED",
      ip,
      userAgent,
      meta: { sessionId: id },
    },
  });

  const currentHash = hashSessionToken(session.user.sessionId);
  const isCurrent = target.sessionTokenHash === currentHash;
  return NextResponse.json({ ok: true, revokedAt: now.toISOString(), isCurrent });
}

