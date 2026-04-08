"use client";

import Link from "next/link";
import { useState } from "react";

import { StatusBadge } from "@/components/status-badge";
import { DataTableShell } from "@/components/app/data-table-shell";
import { EmptyState } from "@/components/app/empty-state";
import type { TaskStatus } from "@/lib/constants";

type TaskRow = {
  id: string;
  desc: string;
  site: { id: string; name: string };
  assignmentToUserId: string | null;
  assignmentTo: { id: string; name: string | null; email: string | null } | null;
  malfunctionId: string | null;
  malfunction: { id: string; title: string } | null;
  status: TaskStatus;
  statusDetails: string | null;
  createdDatetime: string | Date;
  startDatetime: string | Date | null;
  endClosedDatetime: string | Date | null;
};

export type TasksTableLabels = {
  description: string;
  site: string;
  malfunction: string;
  status: string;
  created: string;
  start: string;
  endClosed: string;
  noTasks: string;
  updateFailed: string;
};

export function TasksTable({
  tasks,
  labels,
  locale,
}: {
  tasks: TaskRow[];
  labels: TasksTableLabels;
  locale: string;
}) {
  void labels.updateFailed;
  const [error] = useState<string | null>(null);

  const STATUS_ORDER: Record<TaskStatus, number> = {
    NEW: 0,
    IN_PROGRESS: 1,
    BLOCKED: 2,
    DONE: 3,
    CLOSED: 4,
  };

  const sorted = [...tasks].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  );

  function toneForStatus(s: TaskStatus) {
    if (s === "DONE" || s === "CLOSED") return "success";
    if (s === "BLOCKED") return "danger";
    if (s === "IN_PROGRESS") return "info";
    return "neutral";
  }

  return (
    <div className="space-y-2">
      {error ? null : null}
      <DataTableShell
        empty={
          tasks.length === 0 ? <EmptyState title={labels.noTasks} /> : undefined
        }
      >
        <table className="min-w-full border-collapse text-start text-sm">
          <thead className="sticky top-0 z-10 bg-muted/40">
          <tr>
            <th className="border-b border-border px-3 py-2 font-medium">
              {labels.description}
            </th>
            <th className="border-b border-border px-3 py-2 font-medium">
              {labels.site}
            </th>

            <th className="border-b border-border px-3 py-2 font-medium">
              {labels.malfunction}
            </th>
            <th className="border-b border-border px-3 py-2 font-medium">
              {labels.status}
            </th>

            <th className="border-b border-border px-3 py-2 font-medium">
              {labels.created}
            </th>
            <th className="border-b border-border px-3 py-2 font-medium">
              {labels.start}
            </th>
            <th className="border-b border-border px-3 py-2 font-medium">
              {labels.endClosed}
            </th>
          </tr>
          </thead>
          <tbody>
            {sorted.map((t) => (
              <tr
                key={t.id}
                className="border-b border-border/50 hover:bg-muted/30"
              >
                <td className="max-w-xs px-3 py-2 text-foreground">
                  <Link
                    href={`/tasks/${t.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {t.desc.slice(0, 60)}
                    {t.desc.length > 60 ? "…" : ""}
                  </Link>
              </td>
              <td className="px-3 py-2">{t.site.name.replace(/^\d+\s*[-–—.]?\s*/, "")}</td>
              <td className="px-3 py-2">
                {t.malfunction ? (
                  <Link
                    href={`/malfunctions/${t.malfunction.id}`}
                    className="text-primary hover:underline"
                  >
                    {t.malfunction.title}
                  </Link>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={t.status} tone={toneForStatus(t.status)} />
                </div>
              </td>

              <td suppressHydrationWarning className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                {new Date(t.createdDatetime).toLocaleString(locale)}
              </td>
              <td suppressHydrationWarning className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                {t.startDatetime ? new Date(t.startDatetime).toLocaleString(locale) : "—"}
              </td>
              <td suppressHydrationWarning className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                {t.endClosedDatetime
                  ? new Date(t.endClosedDatetime).toLocaleString(locale)
                  : "—"}
              </td>

              </tr>
            ))}
          </tbody>
        </table>
      </DataTableShell>
    </div>
  );
}
