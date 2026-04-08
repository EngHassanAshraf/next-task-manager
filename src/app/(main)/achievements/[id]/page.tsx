import Link from "next/link";
import { notFound } from "next/navigation";

import { dateLocaleFor, getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { computeActualForAchievement } from "@/lib/services/achievement-metrics";

type PageProps = { params: Promise<{ id: string }> };

export default async function AchievementDetailPage(props: PageProps) {
  const { locale, t } = await getTranslator();
  const dateLoc = dateLocaleFor(locale);
  const { id } = await props.params;
  const row = await prisma.achievement.findUnique({
    where: { id },
    include: {
      site: true,
      owner: { select: { id: true, name: true, email: true } },
    },
  });
  if (!row) {
    notFound();
  }
  const actualValue =
    row.type === "COMPUTED"
      ? await computeActualForAchievement(row)
      : (row.actualValue ?? null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/achievements"
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          {t("common.backToAchievements")}
        </Link>
        <Link
          href={`/achievements/${id}/edit`}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
        >
          {t("common.edit")}
        </Link>
      </div>
      <div>
        <p className="text-xs uppercase text-zinc-500">
          {row.type === "COMPUTED" ? t("achievements.typeBadgeComputed") : t("achievements.typeBadgeCustom")}
        </p>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{row.title}</h1>
        <p className="mt-1 font-mono text-xs text-zinc-500">{row.id}</p>
      </div>
      <dl className="grid max-w-2xl grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-zinc-500">{t("tasks.description")}</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">{row.desc ?? t("common.none")}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("achievements.detailOwner")}</dt>
          <dd>{row.owner.name ?? row.owner.email}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("tasks.site")}</dt>
          <dd>{row.site?.name ?? t("achievements.detailAllSites")}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("tasks.status")}</dt>
          <dd>{row.status}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("achievements.detailActualProgress")}</dt>
          <dd className="text-lg font-semibold">{actualValue ?? t("common.none")}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("achievements.detailTargetMetric")}</dt>
          <dd className="font-mono text-xs">
            {row.targetMetric ? JSON.stringify(row.targetMetric) : t("common.none")}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("achievements.detailCreated")}</dt>
          <dd>{new Date(row.createdDatetime).toLocaleString(dateLoc)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("achievements.detailAchieved")}</dt>
          <dd>
            {row.achievedDatetime
              ? new Date(row.achievedDatetime).toLocaleString(dateLoc)
              : t("common.none")}
          </dd>
        </div>
      </dl>
    </div>
  );
}
