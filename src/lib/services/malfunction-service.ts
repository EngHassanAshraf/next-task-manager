import type { MalfunctionStatus, Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { recordStatusHistory } from "@/lib/services/status-history";

export type MalfunctionCreateInput = Omit<
  Prisma.MalfunctionUncheckedCreateInput,
  "createdByUserId"
>;

function applyMalfunctionStatusSideEffects(
  status: MalfunctionStatus,
  data: Record<string, unknown>
): void {
  const now = new Date();
  if (status === "CLOSED" && data.endClosedDatetime === undefined) {
    data.endClosedDatetime = now;
  }
}

export async function createMalfunction(
  input: MalfunctionCreateInput,
  actorUserId: string
): Promise<{ id: string }> {
  const status = input.status as MalfunctionStatus;
  const data: Prisma.MalfunctionUncheckedCreateInput = {
    ...input,
    createdByUserId: actorUserId,
  };
  applyMalfunctionStatusSideEffects(status, data as Record<string, unknown>);
  const m = await prisma.malfunction.create({ data });
  await recordStatusHistory(
    "MALFUNCTION",
    m.id,
    null,
    m.status,
    actorUserId,
    null
  );

  if (m.taskId) {
    await prisma.task.update({
      where: { id: m.taskId },
      data: { malfunctionId: m.id },
    });
    if (m.status !== "OPENED_ON_TASK") {
      await prisma.malfunction.update({
        where: { id: m.id },
        data: { status: "OPENED_ON_TASK" },
      });
      await recordStatusHistory(
        "MALFUNCTION",
        m.id,
        m.status,
        "OPENED_ON_TASK",
        actorUserId,
        `Linked to task ${m.taskId}`
      );
    }
  }

  return { id: m.id };
}

export async function updateMalfunctionFull(
  id: string,
  input: Prisma.MalfunctionUncheckedUpdateInput,
  actorUserId: string
): Promise<void> {
  const existing = await prisma.malfunction.findUniqueOrThrow({
    where: { id },
  });
  const nextStatus = (input.status ?? existing.status) as MalfunctionStatus;
  const data: Prisma.MalfunctionUncheckedUpdateInput = { ...input };
  applyMalfunctionStatusSideEffects(nextStatus, data as Record<string, unknown>);
  const updated = await prisma.malfunction.update({
    where: { id },
    data,
  });
  if (input.status && input.status !== existing.status) {
    await recordStatusHistory(
      "MALFUNCTION",
      id,
      existing.status,
      updated.status,
      actorUserId,
      null
    );
  }
}

export async function patchMalfunctionStatus(
  id: string,
  status: MalfunctionStatus,
  actorUserId: string
): Promise<void> {
  const existing = await prisma.malfunction.findUniqueOrThrow({
    where: { id },
  });
  const data: Prisma.MalfunctionUncheckedUpdateInput = { status };
  applyMalfunctionStatusSideEffects(status, data as Record<string, unknown>);
  const updated = await prisma.malfunction.update({
    where: { id },
    data,
  });
  if (status !== existing.status) {
    await recordStatusHistory(
      "MALFUNCTION",
      id,
      existing.status,
      updated.status,
      actorUserId,
      null
    );
  }
}
