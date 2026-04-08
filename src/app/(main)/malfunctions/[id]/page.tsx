import Link from "next/link";
import { notFound } from "next/navigation";

import { dateLocaleFor, getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }> };

export default async function MalfunctionDetailPage(props: PageProps) {
  const { locale, t } = await getTranslator();
  const dateLoc = dateLocaleFor(locale);
  const { id } = await props.params;
  const m = await prisma.malfunction.findUnique({
    where: { id },
    include: {
      site: true,
      reporter: { select: { id: true, name: true, email: true } },
      task: { select: { id: true, desc: true, status: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
  if (!m) {
    notFound();
  }
  const statusHistory = await prisma.statusHistory.findMany({
    where: { entityType: "MALFUNCTION", entityId: id },
    orderBy: { changedDatetime: "desc" },
    include: {
      changedBy: { select: { id: true, name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/malfunctions"
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          {t("common.backToMalfunctions")}
        </Link>
        <Link
          href={`/malfunctions/${id}/edit`}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
        >
          {t("common.edit")}
        </Link>
      </div>
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{m.title}</h1>
        <p className="mt-1 font-mono text-xs text-zinc-500">{m.id}</p>
      </div>
      <dl className="grid max-w-2xl grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-zinc-500">{t("malfunctions.formDescription")}</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">{m.desc}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("malfunctions.formSite")}</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">{m.site.name}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("malfunctions.detailReporter")}</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">
            {m.reporter.name ?? m.reporter.email}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("malfunctions.tableTask")}</dt>
          <dd>
            {m.task ? (
              <Link
                href={`/tasks/${m.task.id}`}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {m.task.desc.slice(0, 60)}
                {m.task.desc.length > 60 ? "…" : ""}
              </Link>
            ) : (
              t("common.none")
            )}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("malfunctions.formStatus")}</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">{m.status}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("tasks.created")}</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">
            {new Date(m.createdDatetime).toLocaleString(dateLoc)}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("malfunctions.tableEndClosed")}</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">
            {m.endClosedDatetime ? new Date(m.endClosedDatetime).toLocaleString(dateLoc) : t("common.none")}
          </dd>
        </div>
      </dl>

      <section>
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">{t("malfunctions.statusHistory")}</h2>
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
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
