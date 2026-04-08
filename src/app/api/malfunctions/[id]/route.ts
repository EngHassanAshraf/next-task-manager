import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { badRequest, forbidden, notFound, unauthorized } from "@/lib/api-response";
import { canEditMalfunction } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { updateMalfunctionFull } from "@/lib/services/malfunction-service";
import { malfunctionCreateSchema } from "@/lib/validators/malfunction";

const include = {
  site: true,
  reporter: { select: { id: true, name: true, email: true } },
  task: { select: { id: true, desc: true, status: true } },
  createdBy: { select: { id: true, name: true, email: true } },
} as const;

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return unauthorized();
  }
  const { id } = await context.params;
  const row = await prisma.malfunction.findUnique({
    where: { id },
    include,
  });
  if (!row) {
    return notFound();
  }
  const statusHistory = await prisma.statusHistory.findMany({
    where: { entityType: "MALFUNCTION", entityId: id },
    orderBy: { changedDatetime: "desc" },
    include: {
      changedBy: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json({ ...row, statusHistory });
}

export async function PUT(request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return unauthorized();
  }
  const { id } = await context.params;
  const existing = await prisma.malfunction.findUnique({ where: { id } });
  if (!existing) {
    return notFound();
  }
  if (!canEditMalfunction(session.user.roleName, session.user.id, existing)) {
    return forbidden();
  }
  const body = await request.json().catch(() => null);
  const parsed = malfunctionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }
  const v = parsed.data;
  await updateMalfunctionFull(
    id,
    {
      title: v.title,
      desc: v.desc,
      siteId: v.siteId,
      reporterUserId: v.reporterUserId,
      taskId: v.taskId ?? null,
      status: v.status,
      endClosedDatetime: v.endClosedDatetime ?? undefined,
    },
    session.user.id
  );
  const row = await prisma.malfunction.findUniqueOrThrow({
    where: { id },
    include,
  });
  return NextResponse.json(row);
}
