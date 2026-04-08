import type { Achievement, Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

export type TargetMetric = {
  metric:
    | "TASKS_DONE"
    | "TASKS_CLOSED"
    | "MALFUNCTIONS_CLOSED"
    | "MALFUNCTIONS_DONE_ON_TASK";
  target?: number;
  window?: "DAY" | "WEEK" | "MONTH" | "ALL";
  siteIds?: string[];
};

function windowStart(window: TargetMetric["window"]): Date | null {
  if (!window || window === "ALL") return null;
  const now = new Date();
  if (window === "DAY") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (window === "WEEK") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  if (window === "MONTH") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return d;
  }
  return null;
}

export async function computeActualForAchievement(
  row: Achievement
): Promise<number> {
  if (row.type !== "COMPUTED") {
    return row.actualValue ?? 0;
  }
  const tm = row.targetMetric as TargetMetric | null;
  if (!tm?.metric) {
    return 0;
  }
  const since = windowStart(tm.window);

  const siteTask: Prisma.TaskWhereInput =
    tm.siteIds && tm.siteIds.length > 0
      ? { siteId: { in: tm.siteIds } }
      : row.siteId
        ? { siteId: row.siteId }
        : {};

  const siteMal: Prisma.MalfunctionWhereInput =
    tm.siteIds && tm.siteIds.length > 0
      ? { siteId: { in: tm.siteIds } }
      : row.siteId
        ? { siteId: row.siteId }
        : {};

  const dateTask: Prisma.TaskWhereInput =
    since === null
      ? {}
      : {
          OR: [
            { endClosedDatetime: { gte: since } },
            { createdDatetime: { gte: since } },
          ],
        };

  const dateMal: Prisma.MalfunctionWhereInput =
    since === null
      ? {}
      : {
          OR: [
            { endClosedDatetime: { gte: since } },
            { createdDatetime: { gte: since } },
          ],
        };

  if (tm.metric === "TASKS_DONE") {
    return prisma.task.count({
      where: {
        status: "DONE",
        ...siteTask,
        ...dateTask,
      },
    });
  }
  if (tm.metric === "TASKS_CLOSED") {
    return prisma.task.count({
      where: {
        status: "CLOSED",
        ...siteTask,
        ...dateTask,
      },
    });
  }
  if (tm.metric === "MALFUNCTIONS_CLOSED") {
    return prisma.malfunction.count({
      where: {
        status: "CLOSED",
        ...siteMal,
        ...dateMal,
      },
    });
  }
  if (tm.metric === "MALFUNCTIONS_DONE_ON_TASK") {
    return prisma.malfunction.count({
      where: {
        status: "DONE_ON_TASK",
        ...siteMal,
        ...dateMal,
      },
    });
  }
  return 0;
}
