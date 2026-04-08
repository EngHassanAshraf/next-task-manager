"use client";

import Link from "next/link";
import { useState } from "react";

import { StatusBadge } from "@/components/status-badge";
import { DataTableShell } from "@/components/app/data-table-shell";
import { EmptyState } from "@/components/app/empty-state";
import type { MalfunctionStatus } from "@/lib/constants";

type Row = {
  id: string;
  title: string;
  desc: string;
  site: { id: string; name: string };
  reporter: { id: string; name: string | null; email: string | null };
  task: { id: string; desc: string } | null;
  status: MalfunctionStatus;
  createdDatetime: string | Date;
  endClosedDatetime: string | Date | null;
};

export type MalfunctionsTableLabels = {
  id: string;
  title: string;
  site: string;
  reporter: string;
  task: string;
  status: string;
  created: string;
  endClosed: string;
  actions: string;
  viewTask: string;
  view: string;
  noRows: string;
  updateFailed: string;
};

export function MalfunctionsTable({
  malfunctions,
  labels,
  locale,
}: {
  malfunctions: Row[];
  labels: MalfunctionsTableLabels;
  locale: string;
}) {
  void labels.updateFailed;
  const [error] = useState<string | null>(null);

  const STATUS_ORDER: Record<MalfunctionStatus, number> = {
    OPENED_ON_TASK: 0,
    INACTIVE: 1,
    DONE_ON_TASK: 2,
    CLOSED: 3,
  };

  const sorted = [...malfunctions].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  );

  function toneForStatus(s: MalfunctionStatus) {
    if (s === "CLOSED" || s === "DONE_ON_TASK") return "success";
    if (s === "INACTIVE") return "warning";
    return "info";
  }

  return (
    <div className="space-y-2">
      {error ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
        >
          {error}
        </div>
      ) : null}
      <DataTableShell
        empty={malfunctions.length === 0 ? <EmptyState title={labels.noRows} /> : undefined}
      >
        <table className="min-w-full border-collapse text-start text-sm">
          <thead className="sticky top-0 z-10 bg-muted/40">
          <tr>

            <th className="border-b border-border px-3 py-2 font-medium">
        
              {labels.title}
            </th>
            <th className="border-b border-border px-3 py-2 font-medium">
              {labels.site}
            </th>
            <th className="border-b border-border px-3 py-2 font-medium">
              {labels.reporter}
            </th>
            <th className="border-b border-border px-3 py-2 font-medium">
              {labels.task}
            </th>
            <th className="border-b border-border px-3 py-2 font-medium">
              {labels.status}
            </th>
            <th className="border-b border-border px-3 py-2 font-medium">
              {labels.created}
            </th>
            <th className="border-b border-border px-3 py-2 font-medium">
              {labels.endClosed}
            </th>

          </tr>
          </thead>
          <tbody>
            {sorted.map((m) => (
              <tr
                key={m.id}
                className="border-b border-border/50 hover:bg-muted/30"
              >
                <td className="max-w-xs px-3 py-2 text-foreground">
                  <Link
                  href={`/malfunctions/${m.id}`}
                  className="text-sm text-primary hover:underline"
                >
                {m.title.slice(0, 60)}
                {m.title.length > 60 ? "…" : ""}
                </Link>
              </td>
              <td className="px-3 py-2">{m.site.name.replace(/^\d+\s*[-–—.]?\s*/, "")}</td>
              <td className="px-3 py-2">{m.reporter.name ?? m.reporter.email}</td>
              <td className="px-3 py-2">
                {m.task ? (
                  <Link
                    href={`/tasks/${m.task.id}`}
                    className="text-primary hover:underline"
                  >
                    {labels.viewTask}
                  </Link>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={m.status} tone={toneForStatus(m.status)} />
                </div>
              </td>
              <td suppressHydrationWarning className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                {new Date(m.createdDatetime).toLocaleString(locale)}
              </td>
              <td suppressHydrationWarning className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                {m.endClosedDatetime
                  ? new Date(m.endClosedDatetime).toLocaleString(locale)
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
