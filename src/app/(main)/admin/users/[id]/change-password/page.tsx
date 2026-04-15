import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app/page-header";
import { getTranslator } from "@/lib/i18n/server";
import { getUserById } from "@/lib/services/user-service";

import { ChangePasswordForm } from "./change-password-form";

type PageProps = { params: Promise<{ id: string }> };

export default async function ChangePasswordPage(props: PageProps) {
  const { t } = await getTranslator();
  const { id } = await props.params;

  const user = await getUserById(id);
  if (!user) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <PageHeader
        title={t("adminUserChangePassword.pageTitle")}
        description={user.email ?? undefined}
      />
      <ChangePasswordForm
        userId={id}
        labels={{
          newPassword: t("adminForms.newPassword"),
          hint: t("adminUserChangePassword.hint"),
          change: t("adminForms.changePassword"),
          changing: t("common.saving"),
          couldNotChange: t("adminForms.couldNotChangePassword"),
          successMessage: t("adminForms.passwordChanged"),
          backToUser: t("adminUserChangePassword.backToUser"),
        }}
        backHref={`/admin/users/${id}`}
      />
    </div>
  );
}
