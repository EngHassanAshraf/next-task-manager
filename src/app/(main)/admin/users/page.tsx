import Link from "next/link";
import { getServerSession } from "next-auth";

import { Pagination } from "@/components/pagination";
import { authOptions } from "@/lib/auth";
import { buildUsersAdminTableLabels } from "@/lib/i18n/label-builders";
import { buildPaginationLabels } from "@/lib/i18n/label-builders";
import { getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

import { UsersAdminTable } from "./users-admin-table";

type PageProps = {
  searchParams?: Promise<{ page?: string; pageSize?: string }>;
};

function parsePositiveInt(v: string | undefined, fallback: number, max = 200): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
}

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
            {t("common.backToAdmin")}
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{t("adminUsers.pageTitle")}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("adminUsers.subtitle")}</p>
        </div>
        <Link
          href="/admin/users/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          {t("adminUsers.newUser")}
        </Link>
      </div>
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
