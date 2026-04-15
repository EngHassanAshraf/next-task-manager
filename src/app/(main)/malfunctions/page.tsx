import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { Pagination } from "@/components/pagination";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { buildPaginationLabels } from "@/lib/i18n/label-builders";
import { dateLocaleFor, getTranslator } from "@/lib/i18n/server";
import { parsePositiveInt } from "@/lib/pagination";
import { canAccessOperations, canDeleteMalfunction } from "@/lib/rbac";
import { listMalfunctions, countMalfunctions } from "@/lib/services/malfunction-service";

import { MalfunctionsTable } from "./malfunctions-table";

type PageProps = {
  searchParams?: Promise<{ page?: string; pageSize?: string }>;
};

export default async function MalfunctionsPage(props: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (!canAccessOperations(session.user.roleName)) redirect("/account");

  const { locale, t } = await getTranslator();
  const dateLocale = dateLocaleFor(locale);
  const sp = (await props.searchParams) ?? {};
  const pageSize = parsePositiveInt(sp.pageSize, 50, 200);
  const page = parsePositiveInt(sp.page, 1, 1000000);
  const skip = (page - 1) * pageSize;

  const [total, allRows] = await Promise.all([
    countMalfunctions({ roleName: session.user.roleName, userId: session.user.id }),
    listMalfunctions({ roleName: session.user.roleName, userId: session.user.id }),
  ]);

  const rows = allRows.slice(skip, skip + pageSize);

  const rowsWithPerms = rows.map((m) => ({
    ...m,
    canDelete: canDeleteMalfunction(session.user.roleName, session.user.id, m),
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title={
          <>
            {t("malfunctions.pageTitle")}{" "}
            <span className="text-muted-foreground">({total.toLocaleString(dateLocale)})</span>
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
        locale={dateLocale}
      />
      <MalfunctionsTable
        malfunctions={rowsWithPerms}
        locale={dateLocale}
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
          deleteConfirm: t("common.confirmDelete"),
          deleteFailed: t("common.deleteFailed"),
        }}
      />
    </div>
  );
}
