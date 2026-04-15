import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { assertUserAccountManager } from "@/lib/api-admin";
import { authOptions } from "@/lib/auth";
import { badRequest, forbidden, notFound, tooManyRequests } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { siteAdminCannotManageAdminRole } from "@/lib/user-account-policy";
import { userStatusPatchSchema, userUpdateSchema } from "@/lib/validators/admin";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  const denied = assertUserAccountManager(session);
  if (denied) return denied;
  const rl = rateLimit({
    key: `api:users:update:${session!.user.id}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(undefined, rl.retryAfterSeconds);

  const { id } = await context.params;
  const target = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
  if (!target) {
    return notFound();
  }
  if (siteAdminCannotManageAdminRole(session!.user.roleName, target.role.name)) {
    return forbidden();
  }

  const body = await request.json().catch(() => null);
  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }
  const v = parsed.data;

  // Check if email is being changed and if it's unique
  if (v.email && v.email !== target.email) {
    const existing = await prisma.user.findUnique({ where: { email: v.email } });
    if (existing) {
      return badRequest("Email already in use.");
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: v,
    include: { role: true },
  });
  return NextResponse.json(updated);
}

export async function PATCH(request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  const denied = assertUserAccountManager(session);
  if (denied) return denied;
  const rl = rateLimit({
    key: `api:users:patch:${session!.user.id}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(undefined, rl.retryAfterSeconds);

  const { id } = await context.params;
  const target = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
  if (!target) {
    return notFound();
  }
  if (siteAdminCannotManageAdminRole(session!.user.roleName, target.role.name)) {
    return forbidden();
  }

  const body = await request.json().catch(() => null);
  const parsed = userStatusPatchSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }
  const nextActive = parsed.data.active;

  if (nextActive && target.deletedAt) {
    return badRequest("Cannot activate a deleted user.");
  }
  if (!nextActive && id === session!.user.id) {
    return badRequest("Cannot deactivate yourself.");
  }

  await prisma.user.update({
    where: { id },
    data: { active: nextActive },
  });
  return NextResponse.json({ ok: true, active: nextActive });
}

export async function DELETE(_request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  const denied = assertUserAccountManager(session);
  if (denied) return denied;
  const rl = rateLimit({
    key: `api:users:delete:${session!.user.id}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(undefined, rl.retryAfterSeconds);

  const { id } = await context.params;
  if (id === session!.user.id) {
    return badRequest("Cannot delete yourself.");
  }

  const target = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
  if (!target) {
    return notFound();
  }
  if (siteAdminCannotManageAdminRole(session!.user.roleName, target.role.name)) {
    return forbidden();
  }
  if (target.deletedAt) {
    return badRequest("User is already deleted.");
  }

  await prisma.session.deleteMany({ where: { userId: id } });
  await prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      active: false,
      passwordHash: null,
    },
  });
  return NextResponse.json({ ok: true });
}
