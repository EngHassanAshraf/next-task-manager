import Link from "next/link";

import { buildLinkRolePermissionFormLabels } from "@/lib/i18n/label-builders";
import { getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

import { LinkRolePermissionForm } from "./link-role-permission-form";

export default async function NewRolePermissionPage() {
  const { t } = await getTranslator();
  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.permission.findMany({ orderBy: { code: "asc" }, select: { id: true, code: true } }),
  ]);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          {t("common.backToAdmin")}
        </Link>
      </div>
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("admin.cards.linkRolePermission.title")}
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("adminForms.linkIntro")}</p>
      <LinkRolePermissionForm
        roles={roles}
        permissions={permissions}
        labels={buildLinkRolePermissionFormLabels(t)}
      />
    </div>
  );
}
