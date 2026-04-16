import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";

import { PageHeader } from "@/components/app/page-header";
import { authOptions } from "@/lib/auth";
import { getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin, isDepAdmin } from "@/lib/rbac";
import { getUserById } from "@/lib/services/user-service";

import { EditUserForm } from "./edit-user-form";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditUserPage(props: PageProps) {
  const { t } = await getTranslator();
  const { id } = await props.params;
  const session = await getServerSession(authOptions);

  const [user, allRoles] = await Promise.all([
    getUserById(id),
    prisma.role.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!user) notFound();

  const actorRole = session?.user?.roleName;
  const roles = allRoles.filter((r) => {
    if (isSuperAdmin(r.name)) return false;
    if (isDepAdmin(r.name) && !isSuperAdmin(actorRole)) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <PageHeader
        title={t("adminUserEdit.pageTitle")}
        description={user.email ?? undefined}
      />
      <EditUserForm
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.roleId,
          active: user.active,
          deletedAt: user.deletedAt?.toISOString() ?? null,
        }}
        roles={roles}
        labels={{
          name: t("adminUsers.tableName"),
          email: t("adminUsers.tableEmail"),
          role: t("adminForms.role"),
          selectRole: t("common.selectRole"),
          activeStatus: t("adminForms.activeStatus"),
          save: t("adminForms.saveUser"),
          saving: t("common.saving"),
          couldNotSave: t("adminForms.couldNotSaveUser"),
          backToUser: t("adminUserEdit.backToUser"),
        }}
        backHref={`/admin/users/${id}`}
      />
    </div>
  );
}
