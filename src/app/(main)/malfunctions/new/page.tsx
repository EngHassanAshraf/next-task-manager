import Link from "next/link";

import { assignableUserWhere } from "@/lib/assignable-user";
import { buildMalfunctionFormLabels } from "@/lib/i18n/label-builders";
import { getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { sortSitesByDisplayName } from "@/lib/site-name-sort";

import { NewMalfunctionForm } from "./new-malfunction-form";

export default async function NewMalfunctionPage() {
  const { t } = await getTranslator();
  const [sitesRaw, users, tasks] = await Promise.all([
    prisma.site.findMany(),
    prisma.user.findMany({
      where: assignableUserWhere,
      orderBy: { email: "asc" },
      select: { id: true, name: true, email: true },
    }),
    prisma.task.findMany({
      orderBy: { createdDatetime: "desc" },
      select: { id: true, desc: true, status: true },
    }),
  ]);
  const sites = sortSitesByDisplayName(sitesRaw);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/malfunctions"
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          {t("common.backToMalfunctions")}
        </Link>
      </div>
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("malfunctions.newTitle")}
      </h1>
      <NewMalfunctionForm
        sites={sites}
        users={users}
        tasks={tasks}
        labels={buildMalfunctionFormLabels(t)}
      />
    </div>
  );
}
