import Link from "next/link";
import { getServerSession } from "next-auth";

import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { dateLocaleFor, getTranslator } from "@/lib/i18n/server";

import { PasswordForm } from "./password-form";
import { SecurityClient } from "./security-client";

export default async function AccountSecurityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const { locale, t } = await getTranslator();
  const dateLoc = dateLocaleFor(locale);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.account")}
        description="Security"
        actions={
          <Button asChild variant="outline">
            <Link href="/account">Back</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current session</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Session ID: <span className="font-mono" dir="ltr">{session.user.sessionId.slice(0, 12)}…</span>
            <div className="mt-2 text-xs">
              Times are formatted in <span dir="ltr">{dateLoc}</span>.
            </div>
          </CardContent>
        </Card>
      </div>

      <SecurityClient locale={dateLoc} />
    </div>
  );
}

