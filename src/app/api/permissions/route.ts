import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { assertAdmin, badRequestIfUniqueViolation } from "@/lib/api-admin";
import { authOptions } from "@/lib/auth";
import { badRequest, serverError, tooManyRequests } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { permissionCreateSchema } from "@/lib/validators/admin";

export async function GET() {
  const session = await getServerSession(authOptions);
  const denied = assertAdmin(session);
  if (denied) return denied;
  const permissions = await prisma.permission.findMany({
    orderBy: { code: "asc" },
    include: {
      roles: { include: { role: true } },
    },
  });
  return NextResponse.json(permissions);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const denied = assertAdmin(session);
  if (denied) return denied;
  const rl = rateLimit({
    key: `api:permissions:create:${session!.user.id}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(undefined, rl.retryAfterSeconds);
  const body = await request.json().catch(() => null);
  const parsed = permissionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }
  const v = parsed.data;
  try {
    const permission = await prisma.permission.create({
      data: {
        code: v.code,
        description: v.description ?? null,
      },
    });
    return NextResponse.json(permission, { status: 201 });
  } catch (e) {
    const u = badRequestIfUniqueViolation(e);
    if (u) return u;
    console.error(e);
    return serverError("Could not create permission");
  }
}
