import Link from "next/link";
import { getServerSession } from "next-auth";

import { PageHeader } from "@/components/app/page-header";
import { authOptions } from "@/lib/auth";
import { buildNewUserFormLabels } from "@/lib/i18n/label-builders";
import { getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/rbac";

import { NewUserForm } from "./new-user-form";

export default async function NewUserPage() {
  const { t } = await getTranslator();
  const session = await getServerSession(authOptions);
  const allRoles = await prisma.role.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  const roles = isAdmin(session?.user?.roleName)
    ? allRoles
    : allRoles.filter((r) => r.name !== "ADMIN");

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="text-sm text-primary hover:underline">
          {t("adminUserDetail.backToUsers")}
        </Link>
      </div>
      <PageHeader title={t("adminUsers.newUser")} />
      <NewUserForm roles={roles} labels={buildNewUserFormLabels(t)} />
    </div>
  );
}
