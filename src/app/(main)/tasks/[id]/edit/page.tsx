import Link from "next/link";
import { notFound } from "next/navigation";

import { assignableUserWhere } from "@/lib/assignable-user";
import { buildEditTaskFormLabels } from "@/lib/i18n/label-builders";
import { getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { sortSitesByDisplayName } from "@/lib/site-name-sort";

import { EditTaskForm } from "./edit-task-form";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditTaskPage(props: PageProps) {
  const { t } = await getTranslator();
  const { id } = await props.params;
  const [task, sitesRaw, users, malfunctions] = await Promise.all([
    prisma.task.findUnique({ where: { id } }),
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
  if (!task) {
    notFound();
  }
  const sites = sortSitesByDisplayName(sitesRaw);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center gap-3">
        <Link href={`/tasks/${id}`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          {t("common.backToTask")}
        </Link>
      </div>
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{t("tasks.editTitle")}</h1>
      <EditTaskForm
        task={task}
        sites={sites}
        users={users}
        malfunctions={malfunctions}
        labels={buildEditTaskFormLabels(t)}
      />
    </div>
  );
}
