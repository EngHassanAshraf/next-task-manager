import Link from "next/link";
import { getServerSession } from "next-auth";

import { PageHeader } from "@/components/app/page-header";
import { authOptions } from "@/lib/auth";
import { getTranslator } from "@/lib/i18n/server";
import { isAdmin } from "@/lib/rbac";

const systemCards = [
  { href: "/admin/sites/new", titleKey: "admin.cards.newSite.title", descKey: "admin.cards.newSite.desc" },
  { href: "/admin/roles", titleKey: "admin.cards.newRole.title", descKey: "admin.cards.newRole.desc" },
  { href: "/admin/permissions", titleKey: "admin.cards.newPermission.title", descKey: "admin.cards.newPermission.desc" },
  {
    href: "/admin/role-permissions/new",
    titleKey: "admin.cards.linkRolePermission.title",
    descKey: "admin.cards.linkRolePermission.desc",
  },
] as const;

const userCards = [
  { href: "/admin/users", titleKey: "admin.cards.users.title", descKey: "admin.cards.users.desc" },
  { href: "/admin/users/new", titleKey: "admin.cards.newUser.title", descKey: "admin.cards.newUser.desc" },
] as const;

export default async function AdminPage() {
  const { t } = await getTranslator();
  const session = await getServerSession(authOptions);
  const fullAdmin = isAdmin(session?.user?.roleName);
  const cards = [...userCards, ...(fullAdmin ? systemCards : [])];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.title")}
        description={fullAdmin ? t("admin.subtitleFull") : t("admin.subtitleSite")}
      />
      <ul className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="block rounded-lg border border-border bg-card p-4 transition hover:border-border/80 hover:bg-accent"
            >
              <span className="font-medium text-card-foreground">{t(c.titleKey)}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{t(c.descKey)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
