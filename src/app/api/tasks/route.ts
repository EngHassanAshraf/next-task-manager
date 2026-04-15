import { TaskStatus } from "@/generated/prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { badRequest, forbidden, unauthorized } from "@/lib/api-response";
import { canAccessOperations } from "@/lib/rbac";
import { listTasks } from "@/lib/services/task-service";
import { createTask } from "@/lib/services/task-service";
import { prisma } from "@/lib/prisma";
import { taskCreateSchema } from "@/lib/validators/task";

const include = {
  site: true,
  assignmentTo: { select: { id: true, name: true, email: true } },
  malfunction: { select: { id: true, title: true } },
  createdBy: { select: { id: true, name: true, email: true } },
} as const;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();
  if (!canAccessOperations(session.user.roleName)) return forbidden();

  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId") ?? undefined;
  const statusParam = searchParams.get("status") as TaskStatus | null;
  const assigneeId = searchParams.get("assigneeId") ?? undefined;
  const hasMalfunction = searchParams.get("hasMalfunction");

  const tasks = await listTasks({
    roleName: session.user.roleName,
    userId: session.user.id,
    siteId,
    status: statusParam && Object.values(TaskStatus).includes(statusParam) ? statusParam : undefined,
    assigneeId,
    hasMalfunction:
      hasMalfunction === "true" ? true : hasMalfunction === "false" ? false : undefined,
  });
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();
  if (!canAccessOperations(session.user.roleName)) return forbidden();

  const body = await request.json().catch(() => null);
  const parsed = taskCreateSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

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
  const task = await prisma.task.findUniqueOrThrow({ where: { id }, include });
  return NextResponse.json(task, { status: 201 });
}
