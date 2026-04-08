import Link from "next/link";

import { assignableUserWhere } from "@/lib/assignable-user";
import { buildTaskFormLabels } from "@/lib/i18n/label-builders";
import { getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { sortSitesByDisplayName } from "@/lib/site-name-sort";

import { NewTaskForm } from "./new-task-form";

export default async function NewTaskPage() {
  const { t } = await getTranslator();
  const [sitesRaw, users, malfunctions] = await Promise.all([
    prisma.site.findMany(),
    prisma.user.findMany({
      where: assignableUserWhere,
      orderBy: { email: "asc" },
      select: { id: true, name: true, email: true },
    }),
    prisma.malfunction.findMany({
      orderBy: { createdDatetime: "desc" },
      select: { id: true, title: true, status: true },
    }),
  ]);
  const sites = sortSitesByDisplayName(sitesRaw);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/tasks" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          {t("common.backToTasks")}
        </Link>
      </div>
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{t("tasks.newTitle")}</h1>
      <NewTaskForm
        sites={sites}
        users={users}
        malfunctions={malfunctions}
        labels={buildTaskFormLabels(t)}
      />
    </div>
  );
}
