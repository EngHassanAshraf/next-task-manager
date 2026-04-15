import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app/page-header";
import { getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

import { EditPermissionForm } from "./edit-permission-form";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditPermissionPage(props: PageProps) {
  const { t } = await getTranslator();
  const { id } = await props.params;

  const permission = await prisma.permission.findUnique({ where: { id } });
  if (!permission) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <PageHeader
        title={t("adminPermissions.editTitle")}
        description={permission.code}
      />
      <EditPermissionForm
        permission={{ id: permission.id, code: permission.code, description: permission.description }}
        labels={{
          code: t("adminForms.permissionCode"),
          codePlaceholder: t("adminForms.permissionPlaceholder"),
          descriptionOptional: t("adminForms.descriptionOptional"),
          save: t("common.save"),
          saving: t("common.saving"),
          saveFailed: t("adminPermissions.saveFailed"),
          backToPermissions: t("adminPermissions.backToPermissions"),
        }}
      />
    </div>
  );
}
