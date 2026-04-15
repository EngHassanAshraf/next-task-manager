import Link from "next/link";

import { PageHeader } from "@/components/app/page-header";
import { DataTableShell } from "@/components/app/data-table-shell";
import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { getTranslator } from "@/lib/i18n/server";
import { getPermissions } from "@/lib/services/permission-service";

import { DeletePermissionButton } from "./delete-permission-button";

export default async function PermissionsPage() {
  const { t } = await getTranslator();
  const permissions = await getPermissions();

  // Group by module prefix (e.g. "sites.tasks.view" → "sites")
  const grouped = permissions.reduce<Record<string, typeof permissions>>(
    (acc, p) => {
      const module = p.code.split(".")[0] ?? t("adminPermissions.groupOther");
      (acc[module] ??= []).push(p);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("adminPermissions.pageTitle")}
        description={t("adminPermissions.subtitle")}
      />

      {permissions.length === 0 ? (
        <EmptyState title={t("adminPermissions.noPermissions")} />
      ) : (
        Object.entries(grouped).map(([module, perms]) => (
          <div key={module} className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {module}
            </h2>
            <DataTableShell>
              <table className="min-w-full border-collapse text-start text-sm">
                <thead className="sticky top-0 z-10 bg-muted/40">
                  <tr>
                    <th className="border-b border-border px-3 py-2 font-medium">{t("adminPermissions.tableCode")}</th>
                    <th className="border-b border-border px-3 py-2 font-medium">{t("adminPermissions.tableDescription")}</th>
                    <th className="border-b border-border px-3 py-2 font-medium">{t("adminPermissions.tableRoles")}</th>
                    <th className="border-b border-border px-3 py-2 font-medium">{t("adminPermissions.tableActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {perms.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono text-xs text-foreground">{p.code}</td>
                      <td className="px-3 py-2 text-muted-foreground">{p.description ?? t("common.none")}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {p.roles.length === 0 ? (
                            <span className="text-xs text-muted-foreground">{t("common.none")}</span>
                          ) : (
                            p.roles.map((rr) => (
                              <Badge key={rr.role.id} variant="outline" className="text-xs">
                                {rr.role.name}
                              </Badge>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/permissions/${p.id}/edit`}
                            className="text-xs text-primary hover:underline"
                          >
                            {t("common.edit")}
                          </Link>
                          <DeletePermissionButton
                            id={p.id}
                            confirmMessage={t("adminPermissions.deleteConfirm")}
                            failedMessage={t("adminPermissions.deleteFailed")}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTableShell>
          </div>
        ))
      )}
    </div>
  );
}
