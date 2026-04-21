import type { Prisma } from "@/generated/prisma/client";

import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";
import { sortSitesByDisplayName } from "@/lib/site-name-sort";

export type OverviewReport = {
  tasks: {
    total: number;
    done: number;
    closed: number;
    inProgress: number;
    doneOrClosedPercent: number;
  };
  malfunctions: {
    total: number;
    openedOnTask: number;
    closed: number;
    doneOnTask: number;
    doneOnTaskOrClosedPercent: number;
  };
  bySite: Array<{
    siteId: string;
    siteName: string;
    tasksDoneOrClosed: number;
    tasksTotal: number;
    malfunctionsClosed: number;
    malfunctionsTotal: number;
  }>;
  tasksPerWeek: Array<{ week: string; count: number }>;
};

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  x.setDate(diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function weekKey(d: Date): string {
  return startOfWeek(d).toISOString().slice(0, 10);
}

export async function getOverviewReport(
  siteId?: string
): Promise<OverviewReport> {
  const taskWhere: Prisma.TaskWhereInput = siteId ? { siteId } : {};
  const malWhere: Prisma.MalfunctionWhereInput = siteId ? { siteId } : {};

  const taskDoneClosedWhere: Prisma.TaskWhereInput = siteId
    ? { siteId, status: { in: ["DONE", "CLOSED"] } }
    : { status: { in: ["DONE", "CLOSED"] } };
  const malClosedWhere: Prisma.MalfunctionWhereInput = siteId
    ? { siteId, status: "CLOSED" }
    : { status: "CLOSED" };

  const [
    taskTotal,
    taskDone,
    taskClosed,
    taskInProgress,
    malTotal,
    malOpened,
    malClosed,
    malDoneOnTask,
    sites,
    tasksForWeek,
    taskCountsBySite,
    taskDoneOrClosedBySite,
    malCountsBySite,
    malClosedBySite,
  ] = await Promise.all([
    prisma.task.count({ where: taskWhere }),
    prisma.task.count({
      where: { ...taskWhere, status: "DONE" },
    }),
    prisma.task.count({
      where: { ...taskWhere, status: "CLOSED" },
    }),
    prisma.task.count({
      where: { ...taskWhere, status: "IN_PROGRESS" },
    }),
    prisma.malfunction.count({ where: malWhere }),
    prisma.malfunction.count({
      where: { ...malWhere, status: "OPENED_ON_TASK" },
    }),
    prisma.malfunction.count({
      where: { ...malWhere, status: "CLOSED" },
    }),
    prisma.malfunction.count({
      where: { ...malWhere, status: "DONE_ON_TASK" },
    }),
    prisma.site.findMany(),
    prisma.task.findMany({
      where: {
        ...taskWhere,
        endClosedDatetime: { not: null },
      },
      select: { endClosedDatetime: true },
    }),
    prisma.task.groupBy({
      by: ["siteId"],
      where: siteId ? { siteId } : undefined,
      _count: { _all: true },
    }),
    prisma.task.groupBy({
      by: ["siteId"],
      where: taskDoneClosedWhere,
      _count: { _all: true },
    }),
    prisma.malfunction.groupBy({
      by: ["siteId"],
      where: siteId ? { siteId } : undefined,
      _count: { _all: true },
    }),
    prisma.malfunction.groupBy({
      by: ["siteId"],
      where: malClosedWhere,
      _count: { _all: true },
    }),
  ]);

  const doneOrClosed = taskDone + taskClosed;
  const doneOnTaskOrClosed = malDoneOnTask  + malClosed; 
  
  const tasksPerWeekMap = new Map<string, number>();
  for (const t of tasksForWeek) {
    if (!t.endClosedDatetime) continue;
    const k = weekKey(t.endClosedDatetime);
    tasksPerWeekMap.set(k, (tasksPerWeekMap.get(k) ?? 0) + 1);
  }
  const tasksPerWeek = [...tasksPerWeekMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week, count }));

  const sitesOrdered = sortSitesByDisplayName(sites);

  const taskTotalMap = new Map(taskCountsBySite.map((r) => [r.siteId, r._count._all]));
  const taskDoneClosedMap = new Map(
    taskDoneOrClosedBySite.map((r) => [r.siteId, r._count._all])
  );
  const malTotalMap = new Map(malCountsBySite.map((r) => [r.siteId, r._count._all]));
  const malClosedMap = new Map(malClosedBySite.map((r) => [r.siteId, r._count._all]));

  const bySite: OverviewReport["bySite"] = sitesOrdered
    .filter((s) => (siteId ? s.id === siteId : true))
    .map((s) => ({
      siteId: s.id,
      siteName: s.name,
      tasksDoneOrClosed: taskDoneClosedMap.get(s.id) ?? 0,
      tasksTotal: taskTotalMap.get(s.id) ?? 0,
      malfunctionsClosed: malClosedMap.get(s.id) ?? 0,
      malfunctionsTotal: malTotalMap.get(s.id) ?? 0,
    }));

  return {
    tasks: {
      total: taskTotal,
      done: taskDone,
      closed: taskClosed,
      inProgress: taskInProgress,
      doneOrClosedPercent:
        taskTotal === 0 ? 0 : Math.round((doneOrClosed / taskTotal) * 1000) / 10,
    },
    malfunctions: {
      total: malTotal,
      openedOnTask: malOpened,
      closed: malClosed,
      doneOnTask: malDoneOnTask,
      doneOnTaskOrClosedPercent:
        malTotal === 0 ? 0 : Math.round((doneOnTaskOrClosed / malTotal) * 1000) / 10,
    },
    bySite,
    tasksPerWeek,
  };
}

export const getOverviewReportCached = unstable_cache(
  async (siteId?: string) => getOverviewReport(siteId),
  ["overview-report-v1"],
  { revalidate: 60 }
);
