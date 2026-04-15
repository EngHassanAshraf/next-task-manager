import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { badRequest, forbidden, tooManyRequests, unauthorized } from "@/lib/api-response";
import { canUpdateOwnProfile } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { profilePatchSchema } from "@/lib/validators/account";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();
  if (!canUpdateOwnProfile(session.user.roleName)) return forbidden();

  const rl = rateLimit({
    key: `api:account:profile:${session.user.id}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(undefined, rl.retryAfterSeconds);

  const body = await request.json().catch(() => null);
  const parsed = profilePatchSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
    select: { id: true, name: true, email: true, roleId: true },
  });
  return NextResponse.json(user);
}

