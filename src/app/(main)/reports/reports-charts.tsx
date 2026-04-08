"use client";

import type { OverviewReport } from "@/lib/services/report-service";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ReportsChartsLabels = {
  completionBySite: string;
  tasksByWeek: string;
  legendTasksPct: string;
  legendMalPct: string;
  legendClosed: string;
};

export function ReportsCharts({
  report,
  labels,
}: {
  report: OverviewReport;
  labels: ReportsChartsLabels;
}) {
  const siteData = report.bySite.map((s) => ({
    name: s.siteName,
    tasksPct:
      s.tasksTotal === 0
        ? 0
        : Math.round((s.tasksDoneOrClosed / s.tasksTotal) * 1000) / 10,
    malPct:
      s.malfunctionsTotal === 0
        ? 0
        : Math.round((s.malfunctionsClosed / s.malfunctionsTotal) * 1000) / 10,
  }));

  const weekData = report.tasksPerWeek.map((w) => ({
    week: w.week,
    closed: w.count,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {labels.completionBySite}
        </h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={siteData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "var(--background)", color: "var(--foreground)" }} />
              <Legend />
              <Bar dataKey="tasksPct" name={labels.legendTasksPct} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="malPct" name={labels.legendMalPct} fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {labels.tasksByWeek}
        </h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "var(--background)", color: "var(--foreground)" }} />
              <Bar dataKey="closed" name={labels.legendClosed} fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
