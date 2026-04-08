import Link from "next/link";

import { buildNewAchievementFormLabels } from "@/lib/i18n/label-builders";
import { getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { sortSitesByDisplayName } from "@/lib/site-name-sort";

import { NewAchievementForm } from "./new-achievement-form";

export default async function NewAchievementPage() {
  const { t } = await getTranslator();
  const sites = sortSitesByDisplayName(await prisma.site.findMany());
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/achievements"
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          {t("common.backToAchievements")}
        </Link>
      </div>
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("achievements.newTitle")}
      </h1>
      <NewAchievementForm sites={sites} labels={buildNewAchievementFormLabels(t)} />
    </div>
  );
}
