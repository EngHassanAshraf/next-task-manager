import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  Users,
  MapPin,
  ShieldCheck,
  KeyRound,
  Link2,
  ChevronRight,
} from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { authOptions } from "@/lib/auth";
import { getTranslator } from "@/lib/i18n/server";
import { isAdmin } from "@/lib/rbac";
import { cn } from "@/lib/cn";

type CardDef = {
  href: string;
  titleKey: "admin.cards.users.title" | "admin.cards.newSite.title" | "admin.cards.newRole.title" | "admin.cards.newPermission.title" | "admin.cards.linkRolePermission.title" | "admin.cards.newUser.title";
  descKey: "admin.cards.users.desc" | "admin.cards.newSite.desc" | "admin.cards.newRole.desc" | "admin.cards.newPermission.desc" | "admin.cards.linkRolePermission.desc" | "admin.cards.newUser.desc";
  icon: React.ElementType;
  tint: string;
  iconColor: string;
};

const systemCards: CardDef[] = [
  {
    href: "/admin/sites",
    titleKey: "admin.cards.newSite.title",
    descKey: "admin.cards.newSite.desc",
    icon: MapPin,
    tint: "bg-info/5 hover:bg-info/10",
    iconColor: "text-info bg-info/10",
  },
  {
    href: "/admin/roles",
    titleKey: "admin.cards.newRole.title",
    descKey: "admin.cards.newRole.desc",
    icon: ShieldCheck,
    tint: "bg-success/5 hover:bg-success/10",
    iconColor: "text-success bg-success/10",
  },
  {
    href: "/admin/permissions",
    titleKey: "admin.cards.newPermission.title",
    descKey: "admin.cards.newPermission.desc",
    icon: KeyRound,
    tint: "bg-warning/5 hover:bg-warning/10",
    iconColor: "text-warning bg-warning/10",
  },
  {
    href: "/admin/role-permissions/new",
    titleKey: "admin.cards.linkRolePermission.title",
    descKey: "admin.cards.linkRolePermission.desc",
    icon: Link2,
    tint: "bg-primary/5 hover:bg-primary/10",
    iconColor: "text-primary bg-primary/10",
  },
];

const userCards: CardDef[] = [
  {
    href: "/admin/users",
    titleKey: "admin.cards.users.title",
    descKey: "admin.cards.users.desc",
    icon: Users,
    tint: "bg-primary/5 hover:bg-primary/10",
    iconColor: "text-primary bg-primary/10",
  },
];

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

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <li key={c.href}>
              <Link
                href={c.href}
                className={cn(
                  "group flex items-start gap-4 rounded-xl border border-border p-5",
                  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/5",
                  c.tint
                )}
              >
                <div className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg", c.iconColor)}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{t(c.titleKey)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{t(c.descKey)}</p>
                </div>
                <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
