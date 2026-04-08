import Link from "next/link";

import { Pagination } from "@/components/pagination";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { buildPaginationLabels } from "@/lib/i18n/label-builders";
import { getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

import { MalfunctionsTable } from "./malfunctions-table";

type PageProps = {
  searchParams?: Promise<{ page?: string; pageSize?: string }>;
};

function parsePositiveInt(v: string | undefined, fallback: number, max = 200): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
}

export default async function MalfunctionsPage(props: PageProps) {
  const { locale, t } = await getTranslator();
  const sp = (await props.searchParams) ?? {};
  const pageSize = parsePositiveInt(sp.pageSize, 50, 200);
  const page = parsePositiveInt(sp.page, 1, 1000000);
  const skip = (page - 1) * pageSize;

  const [total, rows] = await Promise.all([
    prisma.malfunction.count(),
    prisma.malfunction.findMany({
      orderBy: [{ createdDatetime: "desc" }, { id: "desc" }],
      take: pageSize,
      skip,
      include: {
        site: true,
        reporter: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, desc: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={
          <>
            {t("malfunctions.pageTitle")}{" "}
            <span className="text-muted-foreground">({total.toLocaleString(locale === "ar" ? "ar-EG" : "en-US")})</span>
          </>
        }
        actions={
          <Button asChild>
            <Link href="/malfunctions/new">{t("malfunctions.newMalfunction")}</Link>
          </Button>
        }
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        basePath="/malfunctions"
        labels={buildPaginationLabels(t)}
        locale={locale === "ar" ? "ar-EG" : "en-US"}
      />
      <MalfunctionsTable
        malfunctions={rows}
        locale={locale === "ar" ? "ar-EG" : "en-US"}
        labels={{
          id: t("malfunctions.tableId"),
          title: t("malfunctions.tableTitle"),
          site: t("tasks.site"),
          reporter: t("malfunctions.tableReporter"),
          task: t("malfunctions.tableTask"),
          status: t("tasks.status"),
          created: t("tasks.created"),
          endClosed: t("malfunctions.tableEndClosed"),
          actions: t("adminUsers.tableActions"),
          viewTask: t("malfunctions.tableViewTask"),
          view: t("tasks.view"),
          noRows: t("malfunctions.noRows"),
          updateFailed: t("common.updateFailed"),
        }}
      />
    </div>
  );
}
