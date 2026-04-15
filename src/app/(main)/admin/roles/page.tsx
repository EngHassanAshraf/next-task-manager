import type { Metadata } from "next";

import { DataTableShell } from "@/components/app/data-table-shell";
import { PageHeader } from "@/components/app/page-header";
import { RolesTable } from "./roles-table";

export const metadata: Metadata = {
  title: "Roles",
};

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        description="Manage system roles and their permissions."
      />
      <DataTableShell>
        <RolesTable />
      </DataTableShell>
    </div>
  );
}