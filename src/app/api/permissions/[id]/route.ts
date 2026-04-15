import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { assertAdmin } from "@/lib/api-admin";
import { authOptions } from "@/lib/auth";
import { badRequest, notFound, tooManyRequests } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  const denied = assertAdmin(session);
  if (denied) return denied;
  const rl = rateLimit({
    key: `api:permissions:delete:${session!.user.id}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(undefined, rl.retryAfterSeconds);

  const { id } = await context.params;
  const permission = await prisma.permission.findUnique({
    where: { id },
    include: { _count: { select: { roles: true } } },
  });
  if (!permission) {
    return notFound();
  }
  if (permission._count.roles > 0) {
    return badRequest("Cannot delete permission that is assigned to roles.");
  }

  await prisma.permission.delete({ where: { id } });
  return NextResponse.json({ success: true });
}