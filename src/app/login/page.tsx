import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Zap } from "lucide-react";

import { LoginForm } from "@/app/login/login-form";
import { PreferencesToggles } from "@/components/preferences-toggles";
import { authOptions } from "@/lib/auth";
import { getTranslator } from "@/lib/i18n/server";

type PageProps = { searchParams: Promise<{ reason?: string }> };

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) redirect("/tasks");

  const sp = await searchParams;
  const inactiveNotice = sp.reason === "inactive";
  const { locale, t } = await getTranslator();

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-6">
        {/* Preferences */}
        <div className="flex justify-end">
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
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          {/* Brand */}
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Zap className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{t("auth.signInTitle")}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t("auth.signInHint")}</p>
            </div>
          </div>

          <LoginForm
            inactiveNotice={inactiveNotice}
            labels={{
              inactiveNotice: t("auth.inactiveNotice"),
              email: t("auth.email"),
              password: t("auth.password"),
              invalidCredentials: t("auth.invalidCredentials"),
              signingIn: t("auth.signingIn"),
              signIn: t("auth.signIn"),
            }}
          />
        </div>
      </div>
    </div>
  );
}
