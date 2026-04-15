"use client";

import type { OverviewReport } from "@/lib/services/report-service";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

export type ReportsChartsLabels = {
  completionBySite: string;
  tasksByWeek: string;
  legendTasksPct: string;
  legendMalPct: string;
  legendClosed: string;
};

/* ── Custom tooltip ─────────────────────────────────────────── */
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg text-xs">
      {label ? <p className="mb-1.5 font-medium text-foreground">{label}</p> : null}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Chart card wrapper ─────────────────────────────────────── */
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="mb-4 text-sm font-semibold text-foreground">{title}</p>
      {children}
    </div>
  );
}

/* ── Axis tick style ────────────────────────────────────────── */
const tickStyle = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };

export function ReportsCharts({
  report,
  labels,
}: {
  report: OverviewReport;
  labels: ReportsChartsLabels;
}) {
  const siteData = report.bySite.map((s) => ({
    name: s.siteName.replace(/^\d+\s*[-–—.]?\s*/, "").slice(0, 14),
    tasksPct:
      s.tasksTotal === 0 ? 0 : Math.round((s.tasksDoneOrClosed / s.tasksTotal) * 1000) / 10,
    malPct:
      s.malfunctionsTotal === 0
        ? 0
        : Math.round((s.malfunctionsClosed / s.malfunctionsTotal) * 1000) / 10,
  }));

  const weekData = report.tasksPerWeek.map((w) => ({
    week: w.week.slice(5), // "MM-DD"
    closed: w.count,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Completion by site */}
      <ChartCard title={labels.completionBySite}>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={siteData} barGap={2} barCategoryGap="30%">
              <CartesianGrid
                vertical={false}
                stroke="hsl(var(--border))"
                strokeDasharray="0"
                strokeOpacity={0.6}
              />
              <XAxis
                dataKey="name"
                tick={tickStyle}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={tickStyle}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
              />
              <Bar
                dataKey="tasksPct"
                name={labels.legendTasksPct}
                fill="hsl(var(--chart-1))"
                radius={[3, 3, 0, 0]}
                maxBarSize={24}
              />
              <Bar
                dataKey="malPct"
                name={labels.legendMalPct}
                fill="hsl(var(--chart-2))"
                radius={[3, 3, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-1" />
            {labels.legendTasksPct}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-2" />
            {labels.legendMalPct}
          </span>
        </div>
      </ChartCard>

      {/* Tasks closed by week */}
      <ChartCard title={labels.tasksByWeek}>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData} barCategoryGap="35%">
              <CartesianGrid
                vertical={false}
                stroke="hsl(var(--border))"
                strokeDasharray="0"
                strokeOpacity={0.6}
              />
              <XAxis
                dataKey="week"
                tick={tickStyle}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={tickStyle}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
              />
              <Bar
                dataKey="closed"
                name={labels.legendClosed}
                radius={[3, 3, 0, 0]}
                maxBarSize={28}
              >
                {weekData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={`hsl(var(--chart-3) / ${0.5 + (i / Math.max(weekData.length - 1, 1)) * 0.5})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-3" />
            {labels.legendClosed}
          </span>
        </div>
      </ChartCard>
    </div>
  );
}
