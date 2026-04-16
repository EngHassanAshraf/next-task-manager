import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
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
      <PageHeader
        title={m.title}
        description={m.id}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/malfunctions/${id}/edit`}>{t("common.edit")}</Link>
          </Button>
        }
      />

      <dl className="grid max-w-2xl grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">{t("malfunctions.formDescription")}</dt>
          <dd className="text-foreground">{m.desc}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("malfunctions.formSite")}</dt>
          <dd className="text-foreground">{m.site.name}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("malfunctions.detailReporter")}</dt>
          <dd className="text-foreground">{m.reporter.name ?? m.reporter.email}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("malfunctions.tableTask")}</dt>
          <dd>
            {m.task ? (
              <Link
                href={`/tasks/${m.task.id}`}
                className="text-primary hover:underline"
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
          <dt className="text-muted-foreground">{t("malfunctions.formStatus")}</dt>
          <dd className="text-foreground">{m.status}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("tasks.created")}</dt>
          <dd suppressHydrationWarning className="text-foreground">
            {new Date(m.createdDatetime).toLocaleString(dateLoc)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("malfunctions.tableEndClosed")}</dt>
          <dd suppressHydrationWarning className="text-foreground">
            {m.endClosedDatetime
              ? new Date(m.endClosedDatetime).toLocaleString(dateLoc)
              : t("common.none")}
          </dd>
        </div>
      </dl>

      <section>
        <h2 className="text-lg font-medium text-foreground">{t("malfunctions.statusHistory")}</h2>
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
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
