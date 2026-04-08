import Link from "next/link";

import { Pagination } from "@/components/pagination";
import { buildPaginationLabels } from "@/lib/i18n/label-builders";
import { getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { computeActualForAchievement } from "@/lib/services/achievement-metrics";

type PageProps = {
  searchParams?: Promise<{ page?: string; pageSize?: string }>;
};

function parsePositiveInt(v: string | undefined, fallback: number, max = 200): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
}

export default async function AchievementsPage(props: PageProps) {
  const { t } = await getTranslator();
  const sp = (await props.searchParams) ?? {};
  const pageSize = parsePositiveInt(sp.pageSize, 50, 200);
  const page = parsePositiveInt(sp.page, 1, 1000000);
  const skip = (page - 1) * pageSize;

  const [total, rows] = await Promise.all([
    prisma.achievement.count(),
    prisma.achievement.findMany({
      orderBy: [{ createdDatetime: "desc" }, { id: "desc" }],
      take: pageSize,
      skip,
      include: {
        site: true,
        owner: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  const enriched = await Promise.all(
    rows.map(async (r) => {
      const actualValue =
        r.type === "COMPUTED"
          ? await computeActualForAchievement(r)
          : (r.actualValue ?? null);
      return { ...r, actualValue };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {t("achievements.pageTitle")}
        </h1>
        <Link
          href="/achievements/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {t("achievements.newAchievement")}
        </Link>
      </div>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        basePath="/achievements"
        labels={buildPaginationLabels(t)}
      />
      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          {t("achievements.sectionComputed")}
        </h2>
        <ul className="mt-2 space-y-2">
          {enriched.filter((a) => a.type === "COMPUTED").length === 0 ? (
            <li className="text-sm text-zinc-500">{t("achievements.noneYet")}</li>
          ) : (
            enriched
              .filter((a) => a.type === "COMPUTED")
              .map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
                >
                  <Link
                    href={`/achievements/${a.id}`}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {a.title}
                  </Link>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {t("achievements.listActual")} {a.actualValue ?? "—"} · {a.status}
                  </span>
                </li>
              ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          {t("achievements.sectionCustom")}
        </h2>
        <ul className="mt-2 space-y-2">
          {enriched.filter((a) => a.type === "CUSTOM").length === 0 ? (
            <li className="text-sm text-zinc-500">{t("achievements.noneYet")}</li>
          ) : (
            enriched
              .filter((a) => a.type === "CUSTOM")
              .map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
                >
                  <Link
                    href={`/achievements/${a.id}`}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {a.title}
                  </Link>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {a.actualValue != null
                      ? `${t("achievements.listValue")} ${a.actualValue}`
                      : "—"}{" "}
                    · {a.status}
                  </span>
                </li>
              ))
          )}
        </ul>
      </section>
    </div>
  );
}
