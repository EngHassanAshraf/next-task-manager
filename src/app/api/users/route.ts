import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { assertUserAccountManager, badRequestIfUniqueViolation } from "@/lib/api-admin";
import { authOptions } from "@/lib/auth";
import { badRequest, forbidden, serverError, tooManyRequests } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { siteAdminCannotManageAdminRole } from "@/lib/user-account-policy";
import { userCreateSchema } from "@/lib/validators/admin";

export async function GET() {
  const session = await getServerSession(authOptions);
  const denied = assertUserAccountManager(session);
  if (denied) return denied;
  const users = await prisma.user.findMany({
    orderBy: { email: "asc" },
    include: { role: true },
  });
  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      roleId: u.roleId,
      roleName: u.role.name,
      active: u.active,
      deletedAt: u.deletedAt?.toISOString() ?? null,
    }))
  );
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const denied = assertUserAccountManager(session);
  if (denied) return denied;
  const rl = rateLimit({
    key: `api:users:create:${session!.user.id}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(undefined, rl.retryAfterSeconds);
  const body = await request.json().catch(() => null);
  const parsed = userCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }
  const v = parsed.data;

  const chosenRole = await prisma.role.findUnique({ where: { id: v.roleId } });
  if (!chosenRole) {
    return badRequest("Invalid role.");
  }
  if (siteAdminCannotManageAdminRole(session!.user.roleName, chosenRole.name)) {
    return forbidden();
  }

  const passwordHash = await bcrypt.hash(v.password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        email: v.email,
        name: v.name ?? null,
        passwordHash,
        roleId: v.roleId,
      },
      include: { role: true },
    });
    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.name,
        active: user.active,
        deletedAt: user.deletedAt?.toISOString() ?? null,
      },
      { status: 201 }
    );
  } catch (e) {
    const u = badRequestIfUniqueViolation(e);
    if (u) return u;
    console.error(e);
    return serverError("Could not create user");
  }
}
