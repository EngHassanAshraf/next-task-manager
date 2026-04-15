import Link from "next/link";
import { notFound } from "next/navigation";

import { assignableUserWhere } from "@/lib/assignable-user";
import { buildEditMalfunctionFormLabels } from "@/lib/i18n/label-builders";
import { getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { sortSitesByDisplayName } from "@/lib/site-name-sort";

import { EditMalfunctionForm } from "./edit-malfunction-form";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditMalfunctionPage(props: PageProps) {
  const { t } = await getTranslator();
  const { id } = await props.params;
  const [m, sitesRaw, users, tasks] = await Promise.all([
    prisma.malfunction.findUnique({ where: { id } }),
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
  if (!m) {
    notFound();
  }
  const sites = sortSitesByDisplayName(sitesRaw);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href={`/malfunctions/${id}`}
          className="text-sm text-primary hover:underline"
        >
          {t("common.backToMalfunction")}
        </Link>
      </div>
      <h1 className="text-xl font-semibold text-foreground">{t("malfunctions.editTitle")}</h1>
      <EditMalfunctionForm
        malfunction={m}
        sites={sites}
        users={users}
        tasks={tasks}
        labels={buildEditMalfunctionFormLabels(t)}
      />
    </div>
  );
}
