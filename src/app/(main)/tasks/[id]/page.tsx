import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { dateLocaleFor, getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }> };

export default async function TaskDetailPage(props: PageProps) {
  const { locale, t } = await getTranslator();
  const dateLoc = dateLocaleFor(locale);
  const { id } = await props.params;
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      site: true,
      assignmentTo: { select: { id: true, name: true, email: true } },
      malfunction: { select: { id: true, title: true, status: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
  if (!task) {
    notFound();
  }
  const statusHistory = await prisma.statusHistory.findMany({
    where: { entityType: "TASK", entityId: id },
    orderBy: { changedDatetime: "desc" },
    include: {
      changedBy: { select: { id: true, name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("tasks.detailTitle")}
        description={task.id}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/tasks/${id}/edit`}>{t("common.edit")}</Link>
          </Button>
        }
      />

      <dl className="grid max-w-2xl grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{t("tasks.description")}</dt>
          <dd className="text-foreground">{task.desc}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("tasks.site")}</dt>
          <dd className="text-foreground">{task.site.name}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("tasks.assignedTo")}</dt>
          <dd className="text-foreground">
            {task.assignmentTo?.name ?? task.assignmentTo?.email ?? t("common.none")}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("tasks.malfunction")}</dt>
          <dd>
            {task.malfunction ? (
              <Link
                href={`/malfunctions/${task.malfunction.id}`}
                className="text-primary hover:underline"
              >
                {task.malfunction.title}
              </Link>
            ) : (
              t("common.none")
            )}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("tasks.status")}</dt>
          <dd className="text-foreground">{task.status}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("tasks.statusDetails")}</dt>
          <dd className="text-foreground">{task.statusDetails ?? t("common.none")}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("tasks.created")}</dt>
          <dd suppressHydrationWarning className="text-foreground">
            {new Date(task.createdDatetime).toLocaleString(dateLoc)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("tasks.start")}</dt>
          <dd suppressHydrationWarning className="text-foreground">
            {task.startDatetime ? new Date(task.startDatetime).toLocaleString(dateLoc) : t("common.none")}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("tasks.endClosed")}</dt>
          <dd suppressHydrationWarning className="text-foreground">
            {task.endClosedDatetime
              ? new Date(task.endClosedDatetime).toLocaleString(dateLoc)
              : t("common.none")}
          </dd>
        </div>
      </dl>

      <section>
        <h2 className="text-lg font-medium text-foreground">{t("tasks.statusHistory")}</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {statusHistory.length === 0 ? (
            <li className="text-muted-foreground">{t("common.noChanges")}</li>
          ) : (
            statusHistory.map((h) => (
              <li
                key={h.id}
                className="rounded border border-border px-3 py-2"
              >
                <span className="text-muted-foreground">
                  {new Date(h.changedDatetime).toLocaleString(dateLoc)}
                </span>{" "}
                — {h.fromStatus ?? t("common.emptyStatus")} → {h.toStatus}
                {h.changedBy ? (
                  <span className="text-muted-foreground">
                    {" "}
                    ({h.changedBy.name ?? h.changedBy.email})
                  </span>
                ) : null}
                {h.note ? <span className="block text-muted-foreground">{h.note}</span> : null}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
