import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { assertUserAccountManager } from "@/lib/api-admin";
import { authOptions } from "@/lib/auth";
import { badRequest, forbidden, notFound, tooManyRequests } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { siteAdminCannotManageAdminRole } from "@/lib/user-account-policy";
import { adminPasswordResetSchema } from "@/lib/validators/account";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  const denied = assertUserAccountManager(session);
  if (denied) return denied;
  const rl = rateLimit({
    key: `api:users:change-password:${session!.user.id}`,
    limit: 10,
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
  const parsed = adminPasswordResetSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });

  await prisma.authEvent.create({
    data: {
      userId: id,
      type: "PASSWORD_CHANGED",
      ip: null,
      userAgent: null,
      meta: { resetBy: session!.user.id },
    },
  });

  return NextResponse.json({ ok: true });
}
