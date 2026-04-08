import Link from "next/link";
import { notFound } from "next/navigation";

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/tasks" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          {t("common.backToTasks")}
        </Link>
        <Link
          href={`/tasks/${id}/edit`}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
        >
          {t("common.edit")}
        </Link>
      </div>
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{t("tasks.detailTitle")}</h1>
        <p className="mt-1 font-mono text-xs text-zinc-500">{task.id}</p>
      </div>
      <dl className="grid max-w-2xl grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500">{t("tasks.description")}</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">{task.desc}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("tasks.site")}</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">{task.site.name}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("tasks.assignedTo")}</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">
            {task.assignmentTo?.name ?? task.assignmentTo?.email ?? t("common.none")}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("tasks.malfunction")}</dt>
          <dd>
            {task.malfunction ? (
              <Link
                href={`/malfunctions/${task.malfunction.id}`}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {task.malfunction.title}
              </Link>
            ) : (
              t("common.none")
            )}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("tasks.status")}</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">{task.status}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("tasks.statusDetails")}</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">{task.statusDetails ?? t("common.none")}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("tasks.created")}</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">
            {new Date(task.createdDatetime).toLocaleString(dateLoc)}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("tasks.start")}</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">
            {task.startDatetime ? new Date(task.startDatetime).toLocaleString(dateLoc) : t("common.none")}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("tasks.endClosed")}</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">
            {task.endClosedDatetime
              ? new Date(task.endClosedDatetime).toLocaleString(dateLoc)
              : t("common.none")}
          </dd>
        </div>
      </dl>

      <section>
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">{t("tasks.statusHistory")}</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {statusHistory.length === 0 ? (
            <li className="text-zinc-500">{t("common.noChanges")}</li>
          ) : (
            statusHistory.map((h) => (
              <li
                key={h.id}
                className="rounded border border-zinc-200 px-3 py-2 dark:border-zinc-800"
              >
                <span className="text-zinc-500">
                  {new Date(h.changedDatetime).toLocaleString(dateLoc)}
                </span>{" "}
                — {h.fromStatus ?? t("common.emptyStatus")} → {h.toStatus}
                {h.changedBy ? (
                  <span className="text-zinc-500">
                    {" "}
                    ({h.changedBy.name ?? h.changedBy.email})
                  </span>
                ) : null}
                {h.note ? <span className="block text-zinc-600">{h.note}</span> : null}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
