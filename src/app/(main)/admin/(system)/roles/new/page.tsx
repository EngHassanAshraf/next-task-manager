import Link from "next/link";

import { buildNewRoleFormLabels } from "@/lib/i18n/label-builders";
import { getTranslator } from "@/lib/i18n/server";

import { NewRoleForm } from "./new-role-form";

export default async function NewRolePage() {
  const { t } = await getTranslator();
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          {t("common.backToAdmin")}
        </Link>
      </div>
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{t("admin.cards.newRole.title")}</h1>
      <NewRoleForm labels={buildNewRoleFormLabels(t)} />
    </div>
  );
}
