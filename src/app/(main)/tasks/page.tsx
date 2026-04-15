import Link from "next/link";

import { Pagination } from "@/components/pagination";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { buildPaginationLabels } from "@/lib/i18n/label-builders";
import { dateLocaleFor, getTranslator } from "@/lib/i18n/server";
import { parsePositiveInt } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

import { TasksTable } from "./tasks-table";

type PageProps = {
  searchParams?: Promise<{ page?: string; pageSize?: string }>;
};

export default async function TasksPage(props: PageProps) {
  const { locale, t } = await getTranslator();
  const dateLocale = dateLocaleFor(locale);
  const sp = (await props.searchParams) ?? {};
  const pageSize = parsePositiveInt(sp.pageSize, 50, 200);
  const page = parsePositiveInt(sp.page, 1, 1000000);
  const skip = (page - 1) * pageSize;

  const [total, tasks] = await Promise.all([
    prisma.task.count(),
    prisma.task.findMany({
      orderBy: [{ createdDatetime: "desc" }, { id: "desc" }],
      take: pageSize,
      skip,
    include: {
      site: true,
      assignmentTo: { select: { id: true, name: true, email: true } },
      malfunction: { select: { id: true, title: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
    }),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={
          <>
            {t("tasks.pageTitle")}{" "}
            <span className="text-muted-foreground">({total.toLocaleString(dateLocale)})</span>
          </>
        }
        actions={
          <Button asChild>
            <Link href="/tasks/new">{t("tasks.newTask")}</Link>
          </Button>
        }
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        basePath="/tasks"
        labels={buildPaginationLabels(t)}
        locale={dateLocale}
      />
      <TasksTable
        tasks={tasks}
        locale={dateLocale}
        labels={{
          description: t("tasks.description"),
          site: t("tasks.site"),
          malfunction: t("tasks.malfunction"),
          status: t("tasks.status"),
          created: t("tasks.created"),
          start: t("tasks.start"),
          endClosed: t("tasks.endClosed"),
          noTasks: t("tasks.noTasks"),
          updateFailed: t("tasks.updateFailed"),
        }}
      />
    </div>
  );
}
