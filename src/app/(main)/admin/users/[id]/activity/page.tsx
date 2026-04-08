import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { dateLocaleFor, getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { canManageUserAccounts } from "@/lib/rbac";
import { siteAdminCannotManageAdminRole } from "@/lib/user-account-policy";

type PageProps = { params: Promise<{ id: string }> };

export default async function UserActivityPage(props: PageProps) {
  const { locale, t } = await getTranslator();
  const dateLoc = dateLocaleFor(locale);
  function fmt(d: Date) {
    return d.toLocaleString(dateLoc, { dateStyle: "medium", timeStyle: "short" });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (!canManageUserAccounts(session.user.roleName)) {
    redirect("/tasks");
  }

  const { id } = await props.params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
  if (!user) {
    notFound();
  }
  if (siteAdminCannotManageAdminRole(session.user.roleName, user.role.name)) {
    redirect("/admin/users");
  }

  const [statusHistory, tasksCreated, malfunctionsCreated, malfunctionsReported, achievements] =
    await Promise.all([
      prisma.statusHistory.findMany({
        where: { changedByUserId: id },
        orderBy: { changedDatetime: "desc" },
        take: 40,
      }),
      prisma.task.findMany({
        where: { createdByUserId: id },
        orderBy: { createdDatetime: "desc" },
        take: 15,
        select: {
          id: true,
          desc: true,
          status: true,
          createdDatetime: true,
          site: { select: { name: true } },
        },
      }),
      prisma.malfunction.findMany({
        where: { createdByUserId: id },
        orderBy: { createdDatetime: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          createdDatetime: true,
        },
      }),
      prisma.malfunction.findMany({
        where: { reporterUserId: id },
        orderBy: { createdDatetime: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          createdDatetime: true,
        },
      }),
      prisma.achievement.findMany({
        where: { ownerUserId: id },
        orderBy: { createdDatetime: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          createdDatetime: true,
        },
      }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/users" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          {t("common.backToUsers")}
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {t("adminUsers.activityPageTitle").replace(
            "{name}",
            user.name ?? user.email ?? user.id
          )}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("adminUsers.activityIntro")}</p>
      </div>

      <section>
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          {t("adminUsers.sectionStatusChanges")}
        </h2>
        <ul className="mt-2 space-y-2 text-sm">
          {statusHistory.length === 0 ? (
            <li className="text-zinc-500">{t("common.noneYet")}</li>
          ) : (
            statusHistory.map((h) => (
              <li key={h.id} className="rounded border border-zinc-200 p-2 dark:border-zinc-800">
                <span className="text-zinc-500">{fmt(h.changedDatetime)}</span> — {h.entityType}{" "}
                <code className="text-xs" dir="ltr">
                  {h.entityId.slice(0, 8)}…
                </code>
                : <bdi>{h.fromStatus ?? t("common.none")}</bdi>{" "}
                <span dir="ltr" className="text-zinc-400" aria-hidden="true">
                  →
                </span>{" "}
                <bdi>{h.toStatus}</bdi>
                {h.note ? (
                  <span className="mt-1 block text-zinc-600 dark:text-zinc-400">{h.note}</span>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          {t("adminUsers.sectionTasksCreated")}
        </h2>
        <ul className="mt-2 space-y-2 text-sm">
          {tasksCreated.length === 0 ? (
            <li className="text-zinc-500">{t("common.noneList")}</li>
          ) : (
            tasksCreated.map((t) => (
              <li key={t.id} className="rounded border border-zinc-200 p-2 dark:border-zinc-800">
                <Link href={`/tasks/${t.id}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                  {t.site.name}
                </Link>
                <span className="text-zinc-500"> · {fmt(t.createdDatetime)}</span>
                <span className="ms-2 text-zinc-500">
                  (<bdi>{t.status}</bdi>)
                </span>
                <p className="mt-1 line-clamp-2 text-zinc-600 dark:text-zinc-400">{t.desc}</p>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          {t("adminUsers.sectionMalfunctionsCreated")}
        </h2>
        <ul className="mt-2 space-y-2 text-sm">
          {malfunctionsCreated.length === 0 ? (
            <li className="text-zinc-500">{t("common.noneList")}</li>
          ) : (
            malfunctionsCreated.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/malfunctions/${m.id}`}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {m.title}
                </Link>
                <span className="text-zinc-500">
                  {" "}
                  · {fmt(m.createdDatetime)} ({m.status})
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          {t("adminUsers.sectionMalfunctionsReported")}
        </h2>
        <ul className="mt-2 space-y-2 text-sm">
          {malfunctionsReported.length === 0 ? (
            <li className="text-zinc-500">{t("common.noneList")}</li>
          ) : (
            malfunctionsReported.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/malfunctions/${m.id}`}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {m.title}
                </Link>
                <span className="text-zinc-500">
                  {" "}
                  · {fmt(m.createdDatetime)} ({m.status})
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          {t("adminUsers.sectionAchievementsOwner")}
        </h2>
        <ul className="mt-2 space-y-2 text-sm">
          {achievements.length === 0 ? (
            <li className="text-zinc-500">{t("common.noneList")}</li>
          ) : (
            achievements.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/achievements/${a.id}`}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {a.title}
                </Link>
                <span className="text-zinc-500">
                  {" "}
                  · {fmt(a.createdDatetime)} ({a.status})
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
