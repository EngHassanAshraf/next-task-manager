import { CheckCircle2, AlertCircle, Clock, Wrench } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { DataTableShell } from "@/components/app/data-table-shell";
import { getTranslator } from "@/lib/i18n/server";
import { getOverviewReportCached } from "@/lib/services/report-service";
import { cn } from "@/lib/cn";

import { ReportsCharts } from "./reports-charts";

type KpiCard = {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  tint: string;
  iconColor: string;
};

export default async function ReportsPage() {
  const { t } = await getTranslator();
  const report = await getOverviewReportCached();

  const kpis: KpiCard[] = [
    {
      label: t("reports.kpiTasksDoneClosed"),
      value: `${report.tasks.doneOrClosedPercent}%`,
      sub: `${report.tasks.done + report.tasks.closed} / ${report.tasks.total}`,
      icon: CheckCircle2,
      tint: "bg-success/5",
      iconColor: "text-success",
    },
    {
      label: t("reports.kpiMalfunctionsClosed"),
      value: `${report.malfunctions.doneOnTaskOrClosedPercent}%`,
      sub: `${report.malfunctions.doneOnTask + report.malfunctions.closed} / ${report.malfunctions.total}`,
      icon: AlertCircle,
      tint: "bg-info/5",
      iconColor: "text-info",
    },
    {
      label: t("reports.kpiTasksInProgress"),
      value: report.tasks.inProgress,
      sub: `/ ${report.tasks.total}`,
      icon: Clock,
      tint: "bg-warning/5",
      iconColor: "text-warning",
    },
    {
      label: t("reports.kpiMalfunctionsDoneOnTask"),
      value: report.malfunctions.doneOnTask,
      sub: `/ ${report.malfunctions.total}`,
      icon: Wrench,
      tint: "bg-primary/5",
      iconColor: "text-primary",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title={t("reports.pageTitle")} />

      {/* KPI cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className={cn(
                "rounded-xl border border-border p-5 transition-shadow hover:shadow-md hover:shadow-black/5",
                k.tint
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground leading-tight">
                  {k.label}
                </p>
                <Icon className={cn("size-4 shrink-0 mt-0.5", k.iconColor)} />
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                {k.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{k.sub}</p>
            </div>
          );
        })}
      </section>

      {/* Charts */}
      <ReportsCharts
        report={report}
        labels={{
          completionBySite: t("reports.chartCompletionBySite"),
          tasksByWeek: t("reports.chartTasksByWeek"),
          legendTasksPct: t("reports.legendTasksPct"),
          legendMalPct: t("reports.legendMalPct"),
          legendClosed: t("reports.legendClosed"),
        }}
      />

      {/* By-site table */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">{t("reports.bySite")}</h2>
        <DataTableShell>
          <table className="min-w-full border-collapse text-start text-sm">
            <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
              <tr>
                {[
                  t("reports.colSite"),
                  t("reports.colTasksDoneClosed"),
                  t("reports.colTasksTotal"),
                  t("reports.colMalfunctionsClosed"),
                  t("reports.colMalfunctionsTotal"),
                ].map((col) => (
                  <th
                    key={col}
                    className="border-b border-border px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {report.bySite.map((s) => {
                if (s.tasksDoneOrClosed || s.tasksTotal || s.malfunctionsClosed || s.malfunctionsTotal){
                  const taskPct = s.tasksTotal === 0 ? 0 : Math.round((s.tasksDoneOrClosed / s.tasksTotal) * 100);
                  return (
                    <tr key={s.siteId} className="transition-colors hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {s.siteName.replace(/^\d+\s*[-–—.]?\s*/, "")}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="font-medium text-foreground">{s.tasksDoneOrClosed}</span>
                        <span className="ms-1.5 text-xs text-muted-foreground/60">({taskPct}%)</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.tasksTotal}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.malfunctionsClosed}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.malfunctionsTotal}</td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        </DataTableShell>
      </section>
    </div>
  );
}
