import type { Session } from "next-auth";
import type { NextResponse } from "next/server";

import { badRequest, forbidden, unauthorized } from "@/lib/api-response";
import { canManageUserAccounts, isAdmin } from "@/lib/rbac";
import { Prisma } from "@/generated/prisma/client";

export function assertAdmin(session: Session | null): NextResponse | null {
  if (!session?.user?.id) {
    return unauthorized();
  }
  if (!isAdmin(session.user.roleName)) {
    return forbidden();
  }
  return null;
}

export function badRequestIfUniqueViolation(e: unknown): NextResponse | null {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    return badRequest("A record with this value already exists.");
  }
  return null;
}

export function assertUserAccountManager(session: Session | null): NextResponse | null {
  if (!session?.user?.id) {
    return unauthorized();
  }
  if (!canManageUserAccounts(session.user.roleName)) {
    return forbidden();
  }
  return null;
}
