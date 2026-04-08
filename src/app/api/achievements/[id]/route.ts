import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { badRequest, forbidden, notFound, unauthorized } from "@/lib/api-response";
import { canEditAchievement } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { computeActualForAchievement } from "@/lib/services/achievement-metrics";
import { achievementUpdateSchema } from "@/lib/validators/achievement";

const include = {
  site: true,
  owner: { select: { id: true, name: true, email: true } },
} as const;

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return unauthorized();
  }
  const { id } = await context.params;
  const row = await prisma.achievement.findUnique({
    where: { id },
    include,
  });
  if (!row) {
    return notFound();
  }
  const actualValue =
    row.type === "COMPUTED"
      ? await computeActualForAchievement(row)
      : (row.actualValue ?? null);
  return NextResponse.json({ ...row, actualValue });
}

export async function PUT(request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return unauthorized();
  }
  const { id } = await context.params;
  const existing = await prisma.achievement.findUnique({ where: { id } });
  if (!existing) {
    return notFound();
  }
  if (
    !canEditAchievement(
      session.user.roleName,
      session.user.id,
      existing.ownerUserId
    )
  ) {
    return forbidden();
  }
  const body = await request.json().catch(() => null);
  const parsed = achievementUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }
  const v = parsed.data;
  const row = await prisma.achievement.update({
    where: { id },
    data: {
      ...(v.title !== undefined ? { title: v.title } : {}),
      ...(v.desc !== undefined ? { desc: v.desc } : {}),
      ...(v.siteId !== undefined ? { siteId: v.siteId } : {}),
      ...(v.targetMetric !== undefined
        ? { targetMetric: v.targetMetric as object }
        : {}),
      ...(v.status !== undefined ? { status: v.status } : {}),
      ...(v.type !== undefined ? { type: v.type } : {}),
      ...(v.actualValue !== undefined ? { actualValue: v.actualValue } : {}),
    },
    include,
  });
  const actualValue =
    row.type === "COMPUTED"
      ? await computeActualForAchievement(row)
      : (row.actualValue ?? null);
  return NextResponse.json({ ...row, actualValue });
}
