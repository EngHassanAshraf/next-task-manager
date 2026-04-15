import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTranslator } from "@/lib/i18n/server";
import { getRoleById } from "@/lib/services/role-service";
import { getPermissions } from "@/lib/services/permission-service";

import { EditRoleForm } from "./edit-role-form";

type PageProps = { params: Promise<{ id: string }> };

export default async function RoleDetailPage(props: PageProps) {
  const { t } = await getTranslator();
  const { id } = await props.params;

  const [role, allPermissions] = await Promise.all([
    getRoleById(id),
    getPermissions(),
  ]);

  if (!role) {
    notFound();
  }

  const assignedIds = role.permissions.map((rp) => rp.permission.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={role.name}
        description={role.description ?? undefined}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/roles">{t("adminRoles.backToRoles")}</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current permissions summary */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {t("adminRoles.tablePermissions")}
          </h2>
          <div className="flex flex-wrap gap-1">
            {assignedIds.length === 0 ? (
              <span className="text-sm text-muted-foreground">{t("adminRoles.noPermissions")}</span>
            ) : (
              role.permissions.map((rp) => (
                <Badge key={rp.permission.id} variant="secondary" className="font-mono text-xs">
                  {rp.permission.code}
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <EditRoleForm
        role={{ id: role.id, name: role.name, description: role.description }}
        allPermissions={allPermissions.map((p) => ({ id: p.id, code: p.code, description: p.description }))}
        assignedPermissionIds={assignedIds}
        labels={{
          roleName: t("adminForms.roleName"),
          descriptionOptional: t("adminForms.descriptionOptional"),
          editPermissions: t("adminRoles.editPermissions"),
          editPermissionsHint: t("adminRoles.editPermissionsHint"),
          save: t("adminForms.saveRole"),
          saving: t("common.saving"),
          couldNotSave: t("adminForms.couldNotSaveRole"),
        }}
      />
    </div>
  );
}
