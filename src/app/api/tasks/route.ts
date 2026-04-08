import type { Prisma } from "@/generated/prisma/client";
import { TaskStatus } from "@/generated/prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { badRequest, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { createTask } from "@/lib/services/task-service";
import { taskCreateSchema } from "@/lib/validators/task";

const include = {
  site: true,
  assignmentTo: { select: { id: true, name: true, email: true } },
  malfunction: { select: { id: true, title: true } },
  createdBy: { select: { id: true, name: true, email: true } },
} as const;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return unauthorized();
  }
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId") ?? undefined;
  const status = searchParams.get("status") as TaskStatus | null;
  const assigneeId = searchParams.get("assigneeId") ?? undefined;
  const hasMalfunction = searchParams.get("hasMalfunction");

  const where: Prisma.TaskWhereInput = {};
  if (siteId) where.siteId = siteId;
  if (status && Object.values(TaskStatus).includes(status)) {
    where.status = status;
  }
  if (assigneeId) where.assignmentToUserId = assigneeId;
  if (hasMalfunction === "true") where.malfunctionId = { not: null };
  if (hasMalfunction === "false") where.malfunctionId = null;

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdDatetime: "desc" },
    include,
  });
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return unauthorized();
  }
  const body = await request.json().catch(() => null);
  const parsed = taskCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }
  const v = parsed.data;
  const { id } = await createTask(
    {
      desc: v.desc,
      siteId: v.siteId,
      assignmentToUserId: v.assignmentToUserId ?? null,
      malfunctionId: v.malfunctionId ?? null,
      status: v.status,
      statusDetails: v.statusDetails ?? null,
      startDatetime: v.startDatetime ?? null,
      endClosedDatetime: v.endClosedDatetime ?? null,
    },
    session.user.id
  );
  const task = await prisma.task.findUniqueOrThrow({
    where: { id },
    include,
  });
  return NextResponse.json(task, { status: 201 });
}
