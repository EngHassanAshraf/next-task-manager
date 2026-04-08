import Link from "next/link";
import { getServerSession } from "next-auth";

import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { dateLocaleFor, getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    // Main layout already protects, but keep safe for direct access.
    return null;
  }
  const { locale, t } = await getTranslator();
  const dateLoc = dateLocaleFor(locale);

  const [me, recent] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    }),
    prisma.authEvent.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);
  if (!me) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.account")}
        description={
          <span className="text-sm">
            <span className="text-muted-foreground">{me.email ?? "—"}</span>{" "}
            <span className="text-muted-foreground">·</span>{" "}
            <span className="text-muted-foreground">({me.role.name})</span>
          </span>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/account/profile">Profile</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/account/security">Security</Link>
            </Button>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your display name.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">
                <div className="font-medium text-foreground">{me.name ?? "—"}</div>
                <div className="text-muted-foreground" dir="ltr">
                  {me.email ?? "—"}
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href="/account/profile">Edit</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage sessions and change your password.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Session: <span className="font-mono" dir="ltr">{session.user.sessionId.slice(0, 8)}…</span>
              </div>
              <Button asChild variant="outline">
                <Link href="/account/security">Open</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">Recent activity</h2>
        <div className="mt-2 space-y-2">
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("common.noneYet")}</p>
          ) : (
            recent.map((e) => (
              <div key={e.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">{e.type}</div>
                  <div className="text-xs text-muted-foreground">
                    {e.createdAt.toLocaleString(dateLoc, { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                </div>
                {(e.ip || e.userAgent) ? (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {e.ip ? <span dir="ltr">{e.ip}</span> : null}
                    {e.ip && e.userAgent ? <span className="mx-2">·</span> : null}
                    {e.userAgent ? <span dir="ltr">{String(e.userAgent).slice(0, 80)}</span> : null}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

