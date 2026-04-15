"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Search, ExternalLink } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { DataTableShell } from "@/components/app/data-table-shell";
import { EmptyState } from "@/components/app/empty-state";
import { cn } from "@/lib/cn";
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
  searchPlaceholder?: string;
};

const STATUS_ORDER: Record<TaskStatus, number> = {
  NEW: 0,
  IN_PROGRESS: 1,
  BLOCKED: 2,
  DONE: 3,
  CLOSED: 4,
};

function toneForStatus(s: TaskStatus) {
  if (s === "DONE" || s === "CLOSED") return "success" as const;
  if (s === "BLOCKED") return "danger" as const;
  if (s === "IN_PROGRESS") return "info" as const;
  return "neutral" as const;
}

export function TasksTable({
  tasks,
  labels,
  locale,
}: {
  tasks: TaskRow[];
  labels: TasksTableLabels;
  locale: string;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = [...tasks].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
    if (!q) return base;
    return base.filter(
      (t) =>
        t.desc.toLowerCase().includes(q) ||
        t.site.name.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q) ||
        t.malfunction?.title.toLowerCase().includes(q)
    );
  }, [tasks, search]);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute inset-s-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={labels.searchPlaceholder ?? "Search…"}
          className={cn(
            "h-8 w-full rounded-lg border border-input bg-background ps-8 pe-3 text-sm",
            "placeholder:text-muted-foreground/60",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          )}
        />
      </div>

      <DataTableShell
        empty={filtered.length === 0 ? <EmptyState title={labels.noTasks} /> : undefined}
      >
        <table className="min-w-full border-collapse text-start text-sm">
          <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
            <tr>
              <th className="border-b border-border px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {labels.description}
              </th>
              <th className="border-b border-border px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {labels.site}
              </th>
              <th className="border-b border-border px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {labels.status}
              </th>
              <th className="border-b border-border px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {labels.malfunction}
              </th>
              <th className="border-b border-border px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {labels.created}
              </th>
              <th className="border-b border-border px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {labels.endClosed}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((t) => (
              <tr
                key={t.id}
                className="group transition-colors hover:bg-muted/40"
              >
                {/* Primary column — emphasized */}
                <td className="px-4 py-3.5">
                  <Link
                    href={`/tasks/${t.id}`}
                    className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <span className="line-clamp-1">
                      {t.desc.slice(0, 70)}{t.desc.length > 70 ? "…" : ""}
                    </span>
                    <ExternalLink className="size-3 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </Link>
                  {t.statusDetails ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{t.statusDetails}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">
                  {t.site.name.replace(/^\d+\s*[-–—.]?\s*/, "")}
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge value={t.status} tone={toneForStatus(t.status)} />
                </td>
                <td className="px-4 py-3.5 text-sm">
                  {t.malfunction ? (
                    <Link
                      href={`/malfunctions/${t.malfunction.id}`}
                      className="text-muted-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {t.malfunction.title}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </td>
                <td suppressHydrationWarning className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground">
                  {new Date(t.createdDatetime).toLocaleString(locale)}
                </td>
                <td suppressHydrationWarning className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground">
                  {t.endClosedDatetime
                    ? new Date(t.endClosedDatetime).toLocaleString(locale)
                    : <span className="text-muted-foreground/40">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableShell>
    </div>
  );
}
