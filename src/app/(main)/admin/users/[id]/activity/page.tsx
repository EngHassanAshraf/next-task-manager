import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/app/page-header";
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
  if (!session?.user?.id) redirect("/login");
  if (!canManageUserAccounts(session.user.roleName)) redirect("/tasks");

  const { id } = await props.params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
  if (!user) notFound();
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
        select: { id: true, title: true, status: true, createdDatetime: true },
      }),
      prisma.malfunction.findMany({
        where: { reporterUserId: id },
        orderBy: { createdDatetime: "desc" },
        take: 10,
        select: { id: true, title: true, status: true, createdDatetime: true },
      }),
      prisma.achievement.findMany({
        where: { ownerUserId: id },
        orderBy: { createdDatetime: "desc" },
        take: 10,
        select: { id: true, title: true, status: true, createdDatetime: true },
      }),
    ]);

  const displayName = user.name ?? user.email ?? user.id;

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("adminUsers.activityPageTitle").replace("{name}", displayName)}
        description={t("adminUsers.activityIntro")}
        actions={
          <Link href={`/admin/users/${id}`} className="text-sm text-primary hover:underline">
            {t("adminUserDetail.backToUsers")}
          </Link>
        }
      />

      <section>
        <h2 className="text-base font-medium text-foreground">{t("adminUsers.sectionStatusChanges")}</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {statusHistory.length === 0 ? (
            <li className="text-muted-foreground">{t("common.noneYet")}</li>
          ) : (
            statusHistory.map((h) => (
              <li key={h.id} className="rounded border border-border px-3 py-2">
                <span className="text-muted-foreground">{fmt(h.changedDatetime)}</span>
                {" — "}
                {h.entityType}{" "}
                <code className="text-xs" dir="ltr">{h.entityId.slice(0, 8)}…</code>
                {": "}
                <bdi>{h.fromStatus ?? t("common.none")}</bdi>
                {" → "}
                <bdi>{h.toStatus}</bdi>
                {h.note ? (
                  <span className="mt-1 block text-muted-foreground">{h.note}</span>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">{t("adminUsers.sectionTasksCreated")}</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {tasksCreated.length === 0 ? (
            <li className="text-muted-foreground">{t("common.noneList")}</li>
          ) : (
            tasksCreated.map((task) => (
              <li key={task.id} className="rounded border border-border px-3 py-2">
                <Link href={`/tasks/${task.id}`} className="font-medium text-primary hover:underline">
                  {task.site.name}
                </Link>
                <span className="text-muted-foreground"> · {fmt(task.createdDatetime)}</span>
                <span className="ms-2 text-muted-foreground">(<bdi>{task.status}</bdi>)</span>
                <p className="mt-1 line-clamp-2 text-muted-foreground">{task.desc}</p>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">{t("adminUsers.sectionMalfunctionsCreated")}</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {malfunctionsCreated.length === 0 ? (
            <li className="text-muted-foreground">{t("common.noneList")}</li>
          ) : (
            malfunctionsCreated.map((m) => (
              <li key={m.id}>
                <Link href={`/malfunctions/${m.id}`} className="text-primary hover:underline">
                  {m.title}
                </Link>
                <span className="text-muted-foreground"> · {fmt(m.createdDatetime)} ({m.status})</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">{t("adminUsers.sectionMalfunctionsReported")}</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {malfunctionsReported.length === 0 ? (
            <li className="text-muted-foreground">{t("common.noneList")}</li>
          ) : (
            malfunctionsReported.map((m) => (
              <li key={m.id}>
                <Link href={`/malfunctions/${m.id}`} className="text-primary hover:underline">
                  {m.title}
                </Link>
                <span className="text-muted-foreground"> · {fmt(m.createdDatetime)} ({m.status})</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-base font-medium text-foreground">{t("adminUsers.sectionAchievementsOwner")}</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {achievements.length === 0 ? (
            <li className="text-muted-foreground">{t("common.noneList")}</li>
          ) : (
            achievements.map((a) => (
              <li key={a.id}>
                <Link href={`/achievements/${a.id}`} className="text-primary hover:underline">
                  {a.title}
                </Link>
                <span className="text-muted-foreground"> · {fmt(a.createdDatetime)} ({a.status})</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
