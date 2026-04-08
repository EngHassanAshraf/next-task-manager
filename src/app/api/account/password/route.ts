import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { badRequest, tooManyRequests, unauthorized } from "@/lib/api-response";
import { getClientIp, hashSessionToken } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { passwordPatchSchema } from "@/lib/validators/account";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return unauthorized();
  }
  const rl = rateLimit({
    key: `api:account:password:${session.user.id}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(undefined, rl.retryAfterSeconds);

  const body = await request.json().catch(() => null);
  const parsed = passwordPatchSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) {
    return badRequest("Password login is not enabled for this account.");
  }
  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) {
    return badRequest("Current password is incorrect.");
  }
  const nextHash = await bcrypt.hash(parsed.data.newPassword, 10);

  const headers = request.headers;
  const ip = getClientIp(headers);
  const userAgent = headers.get("user-agent");
  const currentHash = hashSessionToken(session.user.sessionId);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: nextHash },
    }),
    prisma.authSession.updateMany({
      where: {
        userId: session.user.id,
        revokedAt: null,
        NOT: { sessionTokenHash: currentHash },
      },
      data: { revokedAt: new Date() },
    }),
    prisma.authEvent.create({
      data: {
        userId: session.user.id,
        type: "PASSWORD_CHANGED",
        ip,
        userAgent,
      },
    }),
    prisma.authEvent.create({
      data: {
        userId: session.user.id,
        type: "SIGN_OUT_ALL",
        ip,
        userAgent,
        meta: { reason: "password-change" },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

