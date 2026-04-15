import type { Metadata } from "next";

import { DataTableShell } from "@/components/app/data-table-shell";
import { PageHeader } from "@/components/app/page-header";
import { PermissionsTable } from "./permissions-table";

export const metadata: Metadata = {
  title: "Permissions",
};

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissions"
        description="View all system permissions grouped by module/resource."
      />
      <DataTableShell>
        <PermissionsTable />
      </DataTableShell>
    </div>
  );
}