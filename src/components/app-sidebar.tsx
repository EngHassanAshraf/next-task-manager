import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  LayoutList,
  AlertTriangle,
  Trophy,
  BarChart2,
  Settings,
  User,
  ChevronRight,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getTranslator } from "@/lib/i18n/server";
import { canManageUserAccounts, canAccessAnalytics, canAccessOperations } from "@/lib/rbac";
import { SidebarNav } from "@/components/app/sidebar-nav";

const operationsLinks = [
  { href: "/tasks",        icon: "tasks"        as const },
  { href: "/malfunctions", icon: "malfunctions" as const },
] as const;

const analyticsLinks = [
  { href: "/achievements", icon: "achievements" as const },
  { href: "/reports",      icon: "reports"      as const },
] as const;

const accountLinks = [
  { href: "/account", icon: "account" as const },
] as const;

export async function AppSidebar() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const { t } = await getTranslator();
  const canAdmin = canManageUserAccounts(session.user.roleName);
  const showAnalytics = canAccessAnalytics(session.user.roleName);
  const showOperations = canAccessOperations(session.user.roleName);

  const ops = showOperations ? operationsLinks.map((l) => ({
    href: l.href,
    label: t(`nav.${l.icon}` as Parameters<typeof t>[0]),
    icon: l.icon,
  })) : [];

  const analytics = showAnalytics ? analyticsLinks.map((l) => ({
    href: l.href,
    label: t(`nav.${l.icon}` as Parameters<typeof t>[0]),
    icon: l.icon,
  })) : [];

  const account = accountLinks.map((l) => ({
    href: l.href,
    label: t(`nav.${l.icon}` as Parameters<typeof t>[0]),
    icon: l.icon,
  }));

  const adminLinks = canAdmin
    ? [{ href: "/admin", label: t("nav.admin"), icon: "admin" as const }]
    : [];

  const groups = [
    ...(ops.length > 0 ? [{ label: t("nav.groupOperations"), links: ops }] : []),
    ...(analytics.length > 0 ? [{ label: t("nav.groupAnalytics"), links: analytics }] : []),
    {
      label: t("nav.groupSystem"),
      links: [...account, ...adminLinks],
    },
  ];

  return (
    <SidebarNav
      appTitle={t("nav.appTitle")}
      groups={groups}
      user={{
        name: session.user.name ?? session.user.email ?? "",
        role: session.user.roleName,
      }}
    />
  );
}
