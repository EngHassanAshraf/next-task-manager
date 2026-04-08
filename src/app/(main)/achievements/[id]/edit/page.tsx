import Link from "next/link";
import { notFound } from "next/navigation";

import { buildEditAchievementFormLabels } from "@/lib/i18n/label-builders";
import { getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { sortSitesByDisplayName } from "@/lib/site-name-sort";

import { EditAchievementForm } from "./edit-achievement-form";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditAchievementPage(props: PageProps) {
  const { t } = await getTranslator();
  const { id } = await props.params;
  const row = await prisma.achievement.findUnique({ where: { id } });
  if (!row) {
    notFound();
  }
  const sites = sortSitesByDisplayName(await prisma.site.findMany());
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href={`/achievements/${id}`}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          {t("common.backToAchievement")}
        </Link>
      </div>
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{t("achievements.editTitle")}</h1>
      <EditAchievementForm
        achievement={row}
        sites={sites}
        labels={buildEditAchievementFormLabels(t)}
      />
    </div>
  );
}
