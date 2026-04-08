import { getTranslator } from "@/lib/i18n/server";
import { getOverviewReportCached } from "@/lib/services/report-service";

import { ReportsCharts } from "./reports-charts";

export default async function ReportsPage() {
  const { t } = await getTranslator();
  const report = await getOverviewReportCached();

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{t("reports.pageTitle")}</h1>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs uppercase text-zinc-500">{t("reports.kpiTasksDoneClosed")}</p>
          <p className="mt-1 text-2xl font-semibold">
            {report.tasks.doneOrClosedPercent}%
          </p>
          <p className="text-xs text-zinc-500">
            {report.tasks.done + report.tasks.closed} / {report.tasks.total}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs uppercase text-zinc-500">{t("reports.kpiMalfunctionsClosed")}</p>
          <p className="mt-1 text-2xl font-semibold">
            {report.malfunctions.closedPercent}%
          </p>
          <p className="text-xs text-zinc-500">
            {report.malfunctions.closed} / {report.malfunctions.total}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs uppercase text-zinc-500">{t("reports.kpiTasksInProgress")}</p>
          <p className="mt-1 text-2xl font-semibold">{report.tasks.inProgress}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs uppercase text-zinc-500">{t("reports.kpiMalfunctionsDoneOnTask")}</p>
          <p className="mt-1 text-2xl font-semibold">{report.malfunctions.doneOnTask}</p>
        </div>
      </section>

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

      <section>
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">{t("reports.bySite")}</h2>
        <div className="mt-2 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full text-start text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50">
              <tr>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  {t("reports.colSite")}
                </th>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  {t("reports.colTasksDoneClosed")}
                </th>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  {t("reports.colTasksTotal")}
                </th>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  {t("reports.colMalfunctionsClosed")}
                </th>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  {t("reports.colMalfunctionsTotal")}
                </th>
              </tr>
            </thead>
            <tbody>
              {report.bySite.map((s) => (
                <tr key={s.siteId} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-3 py-2">{s.siteName}</td>
                  <td className="px-3 py-2">{s.tasksDoneOrClosed}</td>
                  <td className="px-3 py-2">{s.tasksTotal}</td>
                  <td className="px-3 py-2">{s.malfunctionsClosed}</td>
                  <td className="px-3 py-2">{s.malfunctionsTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
