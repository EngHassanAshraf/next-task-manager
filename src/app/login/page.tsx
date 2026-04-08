import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { LoginForm } from "@/app/login/login-form";
import { PreferencesToggles } from "@/components/preferences-toggles";
import { authOptions } from "@/lib/auth";
import { getTranslator } from "@/lib/i18n/server";

type PageProps = { searchParams: Promise<{ reason?: string }> };

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    redirect("/tasks");
  }
  const sp = await searchParams;
  const inactiveNotice = sp.reason === "inactive";
  const { locale, t } = await getTranslator();

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-end">
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
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("auth.signInTitle")}</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("auth.signInHint")}</p>
          <div className="mt-6">
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
    </div>
  );
}
