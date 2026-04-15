import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app/page-header";
import { getTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

import { EditSiteForm } from "./edit-site-form";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditSitePage(props: PageProps) {
  const { t } = await getTranslator();
  const { id } = await props.params;

  const site = await prisma.site.findUnique({ where: { id } });
  if (!site) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <PageHeader
        title={t("adminSites.editTitle")}
        description={site.name}
      />
      <EditSiteForm
        site={{ id: site.id, name: site.name }}
        labels={{
          siteName: t("adminForms.siteName"),
          save: t("common.save"),
          saving: t("common.saving"),
          saveFailed: t("adminSites.saveFailed"),
          backToSites: t("adminSites.backToSites"),
        }}
      />
    </div>
  );
}
