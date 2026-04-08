import Link from "next/link";
import { getServerSession } from "next-auth";

import { NavLinks } from "@/components/app/nav-links";
import { PreferencesToggles } from "@/components/preferences-toggles";
import { SignOutButton } from "@/components/sign-out-button";
import { authOptions } from "@/lib/auth";
import { getTranslator } from "@/lib/i18n/server";
import { canManageUserAccounts } from "@/lib/rbac";

const paths = [
  { href: "/tasks", key: "nav.tasks" as const },
  { href: "/malfunctions", key: "nav.malfunctions" as const },
  { href: "/achievements", key: "nav.achievements" as const },
  { href: "/reports", key: "nav.reports" as const },
  { href: "/account", key: "nav.account" as const },
] as const;

export async function AppNav() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  const { locale, t } = await getTranslator();
  const canAdmin = canManageUserAccounts(session.user.roleName);
  const links = [
    ...paths.map((p) => ({ href: p.href, label: t(p.key) })),
    ...(canAdmin ? [{ href: "/admin", label: t("nav.admin") }] : []),
  ];

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/tasks" className="font-semibold text-foreground">
            {t("nav.appTitle")}
          </Link>
          <NavLinks links={links} />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <PreferencesToggles
            locale={locale}
            labels={{
              theme: t("preferences.theme"),
              language: t("preferences.language"),
              light: t("preferences.light"),
              dark: t("preferences.dark"),
              system: t("preferences.system"),
              english: t("preferences.english"),
              arabic: t("preferences.arabic"),
            }}
          />
          <span className="hidden sm:inline">
            {session.user.name ?? session.user.email}{" "}
            <span className="text-muted-foreground">({session.user.roleName})</span>
          </span>
          <SignOutButton label={t("auth.signOut")} />
        </div>
      </div>
    </header>
  );
}
