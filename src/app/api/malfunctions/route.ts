import type { Prisma } from "@/generated/prisma/client";
import { MalfunctionStatus } from "@/generated/prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { badRequest, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { createMalfunction } from "@/lib/services/malfunction-service";
import { malfunctionCreateSchema } from "@/lib/validators/malfunction";

const include = {
  site: true,
  reporter: { select: { id: true, name: true, email: true } },
  task: { select: { id: true, desc: true, status: true } },
  createdBy: { select: { id: true, name: true, email: true } },
} as const;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return unauthorized();
  }
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId") ?? undefined;
  const status = searchParams.get("status") as MalfunctionStatus | null;
  const reporterId = searchParams.get("reporterId") ?? undefined;
  const hasTask = searchParams.get("hasTask");

  const where: Prisma.MalfunctionWhereInput = {};
  if (siteId) where.siteId = siteId;
  if (status && Object.values(MalfunctionStatus).includes(status)) {
    where.status = status;
  }
  if (reporterId) where.reporterUserId = reporterId;
  if (hasTask === "true") where.taskId = { not: null };
  if (hasTask === "false") where.taskId = null;

  const rows = await prisma.malfunction.findMany({
    where,
    orderBy: { createdDatetime: "desc" },
    include,
  });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return unauthorized();
  }
  const body = await request.json().catch(() => null);
  const parsed = malfunctionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }
  const v = parsed.data;
  const { id } = await createMalfunction(
    {
      title: v.title,
      desc: v.desc,
      siteId: v.siteId,
      reporterUserId: v.reporterUserId,
      taskId: v.taskId ?? null,
      status: v.status,
      endClosedDatetime: v.endClosedDatetime ?? null,
    },
    session.user.id
  );
  const row = await prisma.malfunction.findUniqueOrThrow({
    where: { id },
    include,
  });
  return NextResponse.json(row, { status: 201 });
}
