import Link from "next/link";

import { Pagination } from "@/components/pagination";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { buildPaginationLabels } from "@/lib/i18n/label-builders";
import { getTranslator } from "@/lib/i18n/server";
import { parsePositiveInt } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { computeActualForAchievement } from "@/lib/services/achievement-metrics";

type PageProps = {
  searchParams?: Promise<{ page?: string; pageSize?: string }>;
};

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
      <PageHeader
        title={t("achievements.pageTitle")}
        actions={
          <Button asChild>
            <Link href="/achievements/new">{t("achievements.newAchievement")}</Link>
          </Button>
        }
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        basePath="/achievements"
        labels={buildPaginationLabels(t)}
      />

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {t("achievements.sectionComputed")}
        </h2>
        <ul className="mt-2 space-y-2">
          {enriched.filter((a) => a.type === "COMPUTED").length === 0 ? (
            <li className="text-sm text-muted-foreground">{t("achievements.noneYet")}</li>
          ) : (
            enriched
              .filter((a) => a.type === "COMPUTED")
              .map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-border px-3 py-2 text-sm"
                >
                  <Link
                    href={`/achievements/${a.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {a.title}
                  </Link>
                  <span className="text-muted-foreground">
                    {t("achievements.listActual")} {a.actualValue ?? "—"} · {a.status}
                  </span>
                </li>
              ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {t("achievements.sectionCustom")}
        </h2>
        <ul className="mt-2 space-y-2">
          {enriched.filter((a) => a.type === "CUSTOM").length === 0 ? (
            <li className="text-sm text-muted-foreground">{t("achievements.noneYet")}</li>
          ) : (
            enriched
              .filter((a) => a.type === "CUSTOM")
              .map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-border px-3 py-2 text-sm"
                >
                  <Link
                    href={`/achievements/${a.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {a.title}
                  </Link>
                  <span className="text-muted-foreground">
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
