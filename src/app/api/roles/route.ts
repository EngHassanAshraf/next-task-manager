import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { assertAdmin, badRequestIfUniqueViolation } from "@/lib/api-admin";
import { authOptions } from "@/lib/auth";
import { badRequest, serverError, tooManyRequests } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { getRoles } from "@/lib/services/role-service";
import { prisma } from "@/lib/prisma";
import { roleCreateSchema } from "@/lib/validators/admin";

export async function GET() {
  const session = await getServerSession(authOptions);
  const denied = assertAdmin(session);
  if (denied) return denied;
  const roles = await getRoles();
  return NextResponse.json(roles);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const denied = assertAdmin(session);
  if (denied) return denied;
  const rl = rateLimit({
    key: `api:roles:create:${session!.user.id}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(undefined, rl.retryAfterSeconds);
  const body = await request.json().catch(() => null);
  const parsed = roleCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }
  const v = parsed.data;
  try {
    const role = await prisma.role.create({
      data: {
        name: v.name,
        description: v.description ?? null,
      },
    });
    return NextResponse.json(role, { status: 201 });
  } catch (e) {
    const u = badRequestIfUniqueViolation(e);
    if (u) return u;
    console.error(e);
    return serverError("Could not create role");
  }
}
