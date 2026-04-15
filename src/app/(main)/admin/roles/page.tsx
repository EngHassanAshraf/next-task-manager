import Link from "next/link";

import { DataTableShell } from "@/components/app/data-table-shell";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTranslator } from "@/lib/i18n/server";
import { getRoles } from "@/lib/services/role-service";

export default async function RolesPage() {
  const { t } = await getTranslator();
  const roles = await getRoles();

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("adminRoles.pageTitle")}
        description={t("adminRoles.subtitle")}
        actions={
          <Button asChild>
            <Link href="/admin/roles/new">{t("adminRoles.newRole")}</Link>
          </Button>
        }
      />
      <DataTableShell
        empty={
          roles.length === 0
            ? <EmptyState title={t("adminRoles.noRoles")} />
            : undefined
        }
      >
        <table className="min-w-full border-collapse text-start text-sm">
          <thead className="sticky top-0 z-10 bg-muted/40">
            <tr>
              <th className="border-b border-border px-3 py-2 font-medium">{t("adminRoles.tableRole")}</th>
              <th className="border-b border-border px-3 py-2 font-medium">{t("adminRoles.tableDescription")}</th>
              <th className="border-b border-border px-3 py-2 font-medium">{t("adminRoles.tablePermissions")}</th>
              <th className="border-b border-border px-3 py-2 font-medium">{t("adminRoles.tableActions")}</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="px-3 py-2 font-medium text-foreground">{role.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{role.description ?? t("common.none")}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.length === 0 ? (
                      <span className="text-xs text-muted-foreground">{t("adminRoles.noPermissions")}</span>
                    ) : (
                      role.permissions.map((rp) => (
                        <Badge key={rp.permission.id} variant="secondary" className="font-mono text-xs">
                          {rp.permission.code}
                        </Badge>
                      ))
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/roles/${role.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {t("common.edit")}
                    </Link>
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
