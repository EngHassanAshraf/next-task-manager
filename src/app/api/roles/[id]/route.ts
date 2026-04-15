import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { assertAdmin } from "@/lib/api-admin";
import { authOptions } from "@/lib/auth";
import { badRequest, notFound, tooManyRequests } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { roleUpdateSchema } from "@/lib/validators/admin";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  const denied = assertAdmin(session);
  if (denied) return denied;

  const { id } = await context.params;
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      permissions: { include: { permission: true } },
    },
  });
  if (!role) {
    return notFound();
  }
  return NextResponse.json(role);
}

export async function PATCH(request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  const denied = assertAdmin(session);
  if (denied) return denied;
  const rl = rateLimit({
    key: `api:roles:update:${session!.user.id}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(undefined, rl.retryAfterSeconds);

  const { id } = await context.params;
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) {
    return notFound();
  }

  const body = await request.json().catch(() => null);
  const parsed = roleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }
  const v = parsed.data;

  // Update role
  const updatedRole = await prisma.role.update({
    where: { id },
    data: {
      name: v.name,
      description: v.description,
    },
  });

  // Update permissions if provided
  if (v.permissionIds !== undefined) {
    await prisma.rolePermission.deleteMany({ where: { roleId: id } });
    if (v.permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: v.permissionIds.map((pid) => ({ roleId: id, permissionId: pid })),
      });
    }
  }

  // Return updated role with permissions
  const finalRole = await prisma.role.findUnique({
    where: { id },
    include: {
      permissions: { include: { permission: true } },
    },
  });
  return NextResponse.json(finalRole);
}

export async function DELETE(request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  const denied = assertAdmin(session);
  if (denied) return denied;
  const rl = rateLimit({
    key: `api:roles:delete:${session!.user.id}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(undefined, rl.retryAfterSeconds);

  const { id } = await context.params;
  const role = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });
  if (!role) {
    return notFound();
  }
  if (role._count.users > 0) {
    return badRequest("Cannot delete role that has users assigned.");
  }

  await prisma.role.delete({ where: { id } });
  return NextResponse.json({ success: true });
}