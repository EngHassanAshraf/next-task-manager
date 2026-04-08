import type { Prisma } from "@/generated/prisma/client";
import { AchievementType } from "@/generated/prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { badRequest, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { computeActualForAchievement } from "@/lib/services/achievement-metrics";
import { achievementCreateSchema } from "@/lib/validators/achievement";

const include = {
  site: true,
  owner: { select: { id: true, name: true, email: true } },
} as const;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return unauthorized();
  }
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as AchievementType | null;
  const siteId = searchParams.get("siteId") ?? undefined;
  const ownerId = searchParams.get("ownerId") ?? undefined;

  const where: Prisma.AchievementWhereInput = {};
  if (type && Object.values(AchievementType).includes(type)) {
    where.type = type;
  }
  if (siteId) where.siteId = siteId;
  if (ownerId) where.ownerUserId = ownerId;

  const rows = await prisma.achievement.findMany({
    where,
    orderBy: { createdDatetime: "desc" },
    include,
  });

  const enriched = await Promise.all(
    rows.map(async (r) => {
      const actualValue =
        r.type === "COMPUTED"
          ? await computeActualForAchievement(r)
          : (r.actualValue ?? null);
      return { ...r, actualValue };
    })
  );

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return unauthorized();
  }
  const body = await request.json().catch(() => null);
  const parsed = achievementCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }
  const v = parsed.data;
  const row = await prisma.achievement.create({
    data: {
      type: v.type,
      title: v.title,
      desc: v.desc ?? null,
      siteId: v.siteId ?? null,
      ownerUserId: session.user.id,
      targetMetric: v.targetMetric
        ? (v.targetMetric as object)
        : undefined,
      actualValue: v.actualValue ?? null,
      status: v.status,
    },
    include,
  });
  const actualValue =
    row.type === "COMPUTED"
      ? await computeActualForAchievement(row)
      : (row.actualValue ?? null);
  return NextResponse.json({ ...row, actualValue }, { status: 201 });
}
