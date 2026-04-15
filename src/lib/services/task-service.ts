import type { Prisma, TaskStatus } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { recordStatusHistory } from "@/lib/services/status-history";
import { taskVisibilityWhere } from "@/lib/rbac";

export type TaskCreateInput = Omit<
  Prisma.TaskUncheckedCreateInput,
  "createdByUserId"
>;

export type TaskListOptions = {
  roleName: string;
  userId: string;
  siteId?: string;
  status?: TaskStatus;
  assigneeId?: string;
  hasMalfunction?: boolean;
};

const taskInclude = {
  site: true,
  assignmentTo: { select: { id: true, name: true, email: true } },
  malfunction: { select: { id: true, title: true } },
  createdBy: { select: { id: true, name: true, email: true } },
} as const;

export async function listTasks(opts: TaskListOptions) {
  const visibilityFilter = taskVisibilityWhere(opts.roleName, opts.userId);
  const where: Prisma.TaskWhereInput = { ...visibilityFilter };
  if (opts.siteId) where.siteId = opts.siteId;
  if (opts.status) where.status = opts.status;
  if (opts.assigneeId) where.assignmentToUserId = opts.assigneeId;
  if (opts.hasMalfunction === true) where.malfunctionId = { not: null };
  if (opts.hasMalfunction === false) where.malfunctionId = null;
  return prisma.task.findMany({
    where,
    orderBy: { createdDatetime: "desc" },
    include: taskInclude,
  });
}

export async function countTasks(opts: Pick<TaskListOptions, "roleName" | "userId">): Promise<number> {
  const visibilityFilter = taskVisibilityWhere(opts.roleName, opts.userId);
  return prisma.task.count({ where: visibilityFilter ?? {} });
}

function applyTaskStatusSideEffects(
  status: TaskStatus,
  data: Record<string, unknown>
): void {
  const now = new Date();
  if (status === "IN_PROGRESS" && data.startDatetime === undefined) {
    data.startDatetime = now;
  }
  if (status === "DONE" || status === "CLOSED") {
    if (data.endClosedDatetime === undefined) {
      data.endClosedDatetime = now;
    }
  }
}

export async function createTask(
  input: TaskCreateInput,
  actorUserId: string
): Promise<{ id: string }> {
  const status = input.status as TaskStatus;
  const data = {
    ...input,
    createdByUserId: actorUserId,
  } as Prisma.TaskUncheckedCreateInput;
  applyTaskStatusSideEffects(status, data as Record<string, unknown>);
  const task = await prisma.task.create({ data });
  await recordStatusHistory(
    "TASK",
    task.id,
    null,
    task.status,
    actorUserId,
    null
  );

  if (task.malfunctionId) {
    await prisma.malfunction.update({
      where: { id: task.malfunctionId },
      data: {
        taskId: task.id,
        status: "OPENED_ON_TASK",
        endClosedDatetime: null,
      },
    });
    await recordStatusHistory(
      "MALFUNCTION",
      task.malfunctionId,
      null,
      "OPENED_ON_TASK",
      actorUserId,
      `Linked to task ${task.id}`
    );
  }

  return { id: task.id };
}

export async function updateTaskFull(
  id: string,
  input: Prisma.TaskUncheckedUpdateInput,
  actorUserId: string
): Promise<void> {
  const existing = await prisma.task.findUniqueOrThrow({ where: { id } });
  const nextStatus = (input.status ?? existing.status) as TaskStatus;
  const data: Prisma.TaskUncheckedUpdateInput = { ...input };
  applyTaskStatusSideEffects(nextStatus, data as Record<string, unknown>);
  const updated = await prisma.task.update({
    where: { id },
    data,
  });
  if (input.status && input.status !== existing.status) {
    await recordStatusHistory(
      "TASK",
      id,
      existing.status,
      updated.status,
      actorUserId,
      typeof input.statusDetails === "string" ? input.statusDetails : null
    );
  }
}

export async function patchTaskStatus(
  id: string,
  status: TaskStatus,
  statusDetails: string | null | undefined,
  actorUserId: string
): Promise<void> {
  const existing = await prisma.task.findUniqueOrThrow({ where: { id } });
  const data: Prisma.TaskUncheckedUpdateInput = {
    status,
    statusDetails: statusDetails ?? existing.statusDetails,
  };
  applyTaskStatusSideEffects(status, data as Record<string, unknown>);
  const updated = await prisma.task.update({
    where: { id },
    data,
  });
  if (status !== existing.status) {
    await recordStatusHistory(
      "TASK",
      id,
      existing.status,
      updated.status,
      actorUserId,
      statusDetails ?? null
    );
  }

  if (updated.malfunctionId) {
    if (status === "DONE") {
      await prisma.malfunction.update({
        where: { id: updated.malfunctionId },
        data: { status: "DONE_ON_TASK" },
      });
      await recordStatusHistory(
        "MALFUNCTION",
        updated.malfunctionId,
        null,
        "DONE_ON_TASK",
        actorUserId,
        `Task ${id} marked DONE`
      );
    }
    if (status === "CLOSED") {
      await prisma.malfunction.update({
        where: { id: updated.malfunctionId },
        data: { status: "CLOSED", endClosedDatetime: new Date() },
      });
      await recordStatusHistory(
        "MALFUNCTION",
        updated.malfunctionId,
        null,
        "CLOSED",
        actorUserId,
        `Task ${id} marked CLOSED`
      );
    }
  }
}

export async function deleteTask(id: string): Promise<void> {
  await prisma.task.delete({ where: { id } });
}
