import Link from "next/link";

import { DataTableShell } from "@/components/app/data-table-shell";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { sortSitesByDisplayName } from "@/lib/site-name-sort";

import { DeleteSiteButton } from "./delete-site-button";

export default async function SitesPage() {
  const { t } = await getTranslator();
  const sites = sortSitesByDisplayName(await prisma.site.findMany());

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("adminSites.pageTitle")}
        description={t("adminSites.subtitle")}
        actions={
          <Button asChild>
            <Link href="/admin/sites/new">{t("adminSites.newSite")}</Link>
          </Button>
        }
      />
      <DataTableShell
        empty={
          sites.length === 0
            ? <EmptyState title={t("adminSites.noSites")} />
            : undefined
        }
      >
        <table className="min-w-full border-collapse text-start text-sm">
          <thead className="sticky top-0 z-10 bg-muted/40">
            <tr>
              <th className="border-b border-border px-3 py-2 font-medium">{t("adminSites.tableName")}</th>
              <th className="border-b border-border px-3 py-2 font-medium">{t("adminSites.tableActions")}</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site) => (
              <tr key={site.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="px-3 py-2 text-foreground">{site.name}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/sites/${site.id}/edit`}
                      className="text-xs text-primary hover:underline"
                    >
                      {t("common.edit")}
                    </Link>
                    <DeleteSiteButton
                      id={site.id}
                      confirmMessage={t("adminSites.deleteConfirm")}
                      failedMessage={t("adminSites.deleteFailed")}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableShell>
    </div>
  );
}
