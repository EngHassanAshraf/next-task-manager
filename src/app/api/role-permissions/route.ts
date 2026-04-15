import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { assertAdmin, badRequestIfUniqueViolation } from "@/lib/api-admin";
import { authOptions } from "@/lib/auth";
import { badRequest, serverError, tooManyRequests } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { rolePermissionCreateSchema } from "@/lib/validators/admin";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const denied = assertAdmin(session);
  if (denied) return denied;
  const rl = rateLimit({
    key: `api:role-permissions:create:${session!.user.id}`,
    limit: 60,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(undefined, rl.retryAfterSeconds);
  const body = await request.json().catch(() => null);
  const parsed = rolePermissionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }
  const { roleId, permissionId } = parsed.data;
  try {
    const link = await prisma.rolePermission.create({
      data: { roleId, permissionId },
      include: {
        role: true,
        permission: true,
      },
    });
    return NextResponse.json(link, { status: 201 });
  } catch (e) {
    const u = badRequestIfUniqueViolation(e);
    if (u) return u;
    console.error(e);
    return serverError("Could not link role and permission");
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  const denied = assertAdmin(session);
  if (denied) return denied;
  const rl = rateLimit({
    key: `api:role-permissions:delete:${session!.user.id}`,
    limit: 60,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(undefined, rl.retryAfterSeconds);
  const body = await request.json().catch(() => null);
  const parsed = rolePermissionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }
  const { roleId, permissionId } = parsed.data;
  try {
    await prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return serverError("Could not unlink role and permission");
  }
}
