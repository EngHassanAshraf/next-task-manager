import { getServerSession } from "next-auth";
import Link from "next/link";

import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

import { ProfileForm } from "./profile-form";

export default async function AccountProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const { t } = await getTranslator();
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });
  if (!me) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.account")}
        description="Profile"
        actions={
          <Button asChild variant="outline">
            <Link href="/account">Back</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <div>
              Email: <span dir="ltr">{me.email ?? "—"}</span>
            </div>
            <div>Role: {me.role.name}</div>
          </div>
          <ProfileForm initialName={me.name ?? ""} />
        </CardContent>
      </Card>
    </div>
  );
}

