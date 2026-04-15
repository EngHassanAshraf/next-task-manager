import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { dateLocaleFor, getTranslator } from "@/lib/i18n/server";
import { getUserById } from "@/lib/services/user-service";

type PageProps = { params: Promise<{ id: string }> };

export default async function UserDetailPage(props: PageProps) {
  const { locale, t } = await getTranslator();
  const dateLoc = dateLocaleFor(locale);
  const { id } = await props.params;

  const user = await getUserById(id);
  if (!user) {
    notFound();
  }

  const statusLabel = user.deletedAt
    ? t("adminUsers.statusDeleted")
    : user.active
      ? t("adminUsers.statusActive")
      : t("adminUsers.statusInactive");

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name ?? user.email ?? id}
        description={user.email ?? undefined}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/users/${id}/edit`}>{t("adminUserDetail.editUser")}</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/users/${id}/change-password`}>{t("adminUserDetail.changePassword")}</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/users/${id}/activity`}>{t("adminUsers.activity")}</Link>
            </Button>
          </div>
        }
      />

      <dl className="grid max-w-2xl grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{t("adminUserDetail.labelName")}</dt>
          <dd className="text-foreground">{user.name ?? t("common.none")}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("adminUserDetail.labelEmail")}</dt>
          <dd className="text-foreground">{user.email ?? t("common.none")}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("adminUserDetail.labelRole")}</dt>
          <dd>
            <Badge variant="secondary">{user.role.name}</Badge>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("adminUserDetail.labelStatus")}</dt>
          <dd>
            <StatusBadge
              value={statusLabel}
              tone={user.deletedAt ? "warning" : user.active ? "success" : "neutral"}
            />
          </dd>
        </div>
        {user.deletedAt ? (
          <div>
            <dt className="text-muted-foreground">{t("adminUserDetail.labelDeleted")}</dt>
            <dd suppressHydrationWarning className="text-foreground">
              {new Date(user.deletedAt).toLocaleString(dateLoc)}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="pt-2">
        <Link href="/admin/users" className="text-sm text-primary hover:underline">
          {t("adminUserDetail.backToUsers")}
        </Link>
      </div>
    </div>
  );
}
