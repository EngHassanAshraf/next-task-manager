"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Search, ExternalLink } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { DataTableShell } from "@/components/app/data-table-shell";
import { EmptyState } from "@/components/app/empty-state";
import { cn } from "@/lib/cn";
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
  searchPlaceholder?: string;
};

const STATUS_ORDER: Record<MalfunctionStatus, number> = {
  OPENED_ON_TASK: 0,
  INACTIVE: 1,
  DONE_ON_TASK: 2,
  CLOSED: 3,
};

function toneForStatus(s: MalfunctionStatus) {
  if (s === "CLOSED" || s === "DONE_ON_TASK") return "success" as const;
  if (s === "INACTIVE") return "warning" as const;
  return "info" as const;
}

export function MalfunctionsTable({
  malfunctions,
  labels,
  locale,
}: {
  malfunctions: Row[];
  labels: MalfunctionsTableLabels;
  locale: string;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = [...malfunctions].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
    if (!q) return base;
    return base.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.site.name.toLowerCase().includes(q) ||
        m.status.toLowerCase().includes(q) ||
        (m.reporter.name ?? m.reporter.email ?? "").toLowerCase().includes(q)
    );
  }, [malfunctions, search]);

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
        empty={filtered.length === 0 ? <EmptyState title={labels.noRows} /> : undefined}
      >
        <table className="min-w-full border-collapse text-start text-sm">
          <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
            <tr>
              <th className="border-b border-border px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {labels.title}
              </th>
              <th className="border-b border-border px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {labels.site}
              </th>
              <th className="border-b border-border px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {labels.status}
              </th>
              <th className="border-b border-border px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {labels.reporter}
              </th>
              <th className="border-b border-border px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {labels.task}
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
            {filtered.map((m) => (
              <tr
                key={m.id}
                className="group transition-colors hover:bg-muted/40"
              >
                {/* Primary column */}
                <td className="px-4 py-3.5">
                  <Link
                    href={`/malfunctions/${m.id}`}
                    className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <span className="line-clamp-1">
                      {m.title.slice(0, 70)}{m.title.length > 70 ? "…" : ""}
                    </span>
                    <ExternalLink className="size-3 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </Link>
                </td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">
                  {m.site.name.replace(/^\d+\s*[-–—.]?\s*/, "")}
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge value={m.status} tone={toneForStatus(m.status)} />
                </td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">
                  {m.reporter.name ?? m.reporter.email}
                </td>
                <td className="px-4 py-3.5 text-sm">
                  {m.task ? (
                    <Link
                      href={`/tasks/${m.task.id}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {labels.viewTask}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </td>
                <td suppressHydrationWarning className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground">
                  {new Date(m.createdDatetime).toLocaleString(locale)}
                </td>
                <td suppressHydrationWarning className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground">
                  {m.endClosedDatetime
                    ? new Date(m.endClosedDatetime).toLocaleString(locale)
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
