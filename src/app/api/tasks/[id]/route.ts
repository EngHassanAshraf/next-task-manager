import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { badRequest, forbidden, notFound, unauthorized } from "@/lib/api-response";
import { canAccessOperations, canEditTask, canDeleteTask } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { updateTaskFull, deleteTask } from "@/lib/services/task-service";
import { taskCreateSchema } from "@/lib/validators/task";

const include = {
  site: true,
  assignmentTo: { select: { id: true, name: true, email: true } },
  malfunction: { select: { id: true, title: true, status: true } },
  createdBy: { select: { id: true, name: true, email: true } },
} as const;

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();
  if (!canAccessOperations(session.user.roleName)) return forbidden();

  const { id } = await context.params;
  const task = await prisma.task.findUnique({ where: { id }, include });
  if (!task) return notFound();

  // Scoped users can only view tasks they own/are assigned to
  if (!canEditTask(session.user.roleName, session.user.id, task)) {
    return forbidden();
  }

  const statusHistory = await prisma.statusHistory.findMany({
    where: { entityType: "TASK", entityId: id },
    orderBy: { changedDatetime: "desc" },
    include: { changedBy: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json({ ...task, statusHistory });
}

export async function PUT(request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();
  if (!canAccessOperations(session.user.roleName)) return forbidden();

  const { id } = await context.params;
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return notFound();
  if (!canEditTask(session.user.roleName, session.user.id, existing)) return forbidden();

  const body = await request.json().catch(() => null);
  const parsed = taskCreateSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const v = parsed.data;
  await updateTaskFull(
    id,
    {
      desc: v.desc,
      siteId: v.siteId,
      assignmentToUserId: v.assignmentToUserId ?? null,
      malfunctionId: v.malfunctionId ?? null,
      status: v.status,
      statusDetails: v.statusDetails ?? null,
      startDatetime: v.startDatetime ?? undefined,
      endClosedDatetime: v.endClosedDatetime ?? undefined,
    },
    session.user.id
  );
  const task = await prisma.task.findUniqueOrThrow({ where: { id }, include });
  return NextResponse.json(task);
}

export async function DELETE(_request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();
  if (!canAccessOperations(session.user.roleName)) return forbidden();

  const { id } = await context.params;
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return notFound();
  if (!canDeleteTask(session.user.roleName, session.user.id, existing)) return forbidden();

  await deleteTask(id);
  return NextResponse.json({ ok: true });
}
