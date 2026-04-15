import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { assertAdmin, badRequestIfUniqueViolation } from "@/lib/api-admin";
import { authOptions } from "@/lib/auth";
import { badRequest, notFound, serverError, tooManyRequests } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { siteUpdateSchema } from "@/lib/validators/admin";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  const denied = assertAdmin(session);
  if (denied) return denied;

  const { id } = await context.params;
  const site = await prisma.site.findUnique({ where: { id } });
  if (!site) return notFound();
  return NextResponse.json(site);
}

export async function PUT(request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  const denied = assertAdmin(session);
  if (denied) return denied;
  const rl = rateLimit({
    key: `api:sites:update:${session!.user.id}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(undefined, rl.retryAfterSeconds);

  const { id } = await context.params;
  const site = await prisma.site.findUnique({ where: { id } });
  if (!site) return notFound();

  const body = await request.json().catch(() => null);
  const parsed = siteUpdateSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  try {
    const updated = await prisma.site.update({
      where: { id },
      data: { name: parsed.data.name },
    });
    return NextResponse.json(updated);
  } catch (e) {
    const u = badRequestIfUniqueViolation(e);
    if (u) return u;
    console.error(e);
    return serverError("Could not update site");
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  const denied = assertAdmin(session);
  if (denied) return denied;
  const rl = rateLimit({
    key: `api:sites:delete:${session!.user.id}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(undefined, rl.retryAfterSeconds);

  const { id } = await context.params;
  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      _count: { select: { tasks: true, malfunctions: true, achievements: true } },
    },
  });
  if (!site) return notFound();

  const usageCount = site._count.tasks + site._count.malfunctions + site._count.achievements;
  if (usageCount > 0) {
    return badRequest(
      `Cannot delete site — it has ${usageCount} linked record(s). Remove them first.`
    );
  }

  await prisma.site.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
