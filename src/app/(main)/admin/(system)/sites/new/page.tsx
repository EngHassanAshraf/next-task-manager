import Link from "next/link";

import { PageHeader } from "@/components/app/page-header";
import { buildNewSiteFormLabels } from "@/lib/i18n/label-builders";
import { getTranslator } from "@/lib/i18n/server";

import { NewSiteForm } from "./new-site-form";

export default async function NewSitePage() {
  const { t } = await getTranslator();
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <PageHeader title={t("adminSites.newSite")} />
      <NewSiteForm labels={buildNewSiteFormLabels(t)} />
    </div>
  );
}
