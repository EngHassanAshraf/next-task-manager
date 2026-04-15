import Link from "next/link";
import { getServerSession } from "next-auth";

import { Pagination } from "@/components/pagination";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { buildPaginationLabels, buildUsersAdminTableLabels } from "@/lib/i18n/label-builders";
import { getTranslator } from "@/lib/i18n/server";
import { parsePositiveInt } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

import { UsersAdminTable } from "./users-admin-table";

type PageProps = {
  searchParams?: Promise<{ page?: string; pageSize?: string }>;
};

export default async function AdminUsersPage(props: PageProps) {
  const { t } = await getTranslator();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const sp = (await props.searchParams) ?? {};
  const pageSize = parsePositiveInt(sp.pageSize, 50, 200);
  const page = parsePositiveInt(sp.page, 1, 1000000);
  const skip = (page - 1) * pageSize;

  const [total, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      orderBy: [{ email: "asc" }, { id: "asc" }],
      take: pageSize,
      skip,
      include: { role: true },
    }),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("adminUsers.pageTitle")}
        description={t("adminUsers.subtitle")}
        actions={
          <Button asChild>
            <Link href="/admin/users/new">{t("adminUsers.newUser")}</Link>
          </Button>
        }
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        basePath="/admin/users"
        labels={buildPaginationLabels(t)}
      />
      <UsersAdminTable
        labels={buildUsersAdminTableLabels(t)}
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          roleName: u.role.name,
          active: u.active,
          deletedAt: u.deletedAt?.toISOString() ?? null,
        }))}
        currentUserId={session.user.id}
        actorRoleName={session.user.roleName}
      />
    </div>
  );
}
