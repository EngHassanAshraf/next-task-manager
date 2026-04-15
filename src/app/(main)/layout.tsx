import { getServerSession } from "next-auth";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { TopHeader } from "@/components/app/top-header";
import { PreferencesToggles } from "@/components/preferences-toggles";
import { hashSessionToken } from "@/lib/auth-session";
import { getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (!session.user.sessionId) redirect("/login");

  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { active: true, deletedAt: true },
  });
  if (!account || !account.active || account.deletedAt) {
    redirect(`/api/auth/signout?callbackUrl=${encodeURIComponent("/login?reason=inactive")}`);
  }

  const tokenHash = hashSessionToken(session.user.sessionId);
  const authSession = await prisma.authSession.findUnique({
    where: { sessionTokenHash: tokenHash },
    select: { revokedAt: true },
  });
  if (!authSession || authSession.revokedAt) {
    redirect(`/api/auth/signout?callbackUrl=${encodeURIComponent("/login")}`);
  }

  prisma.authSession
    .update({ where: { sessionTokenHash: tokenHash }, data: { lastSeenAt: new Date() } })
    .catch(() => null);

  const { locale, t } = await getTranslator();
  const prefLabels = {
    theme: t("preferences.theme"),
    language: t("preferences.language"),
    light: t("preferences.light"),
    dark: t("preferences.dark"),
    system: t("preferences.system"),
    english: t("preferences.english"),
    arabic: t("preferences.arabic"),
  };

  return (
    <div className="flex h-full min-h-screen">
      {/* Sidebar — desktop */}
      <div className="hidden md:flex md:flex-col md:shrink-0">
        <AppSidebar />
      </div>

      {/* Right side: header (mobile) + content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile top bar */}
        <TopHeader
          locale={locale}
          labels={prefLabels}
          mobileNav={<AppSidebar />}
        />

        {/* Desktop top bar (preferences only) */}
        <div className="hidden h-(--header-height) shrink-0 items-center justify-end border-b border-border bg-background px-4 md:flex">
          <PreferencesToggles locale={locale} labels={prefLabels} />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
