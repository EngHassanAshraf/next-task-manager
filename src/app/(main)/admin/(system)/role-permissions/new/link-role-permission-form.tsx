"use client";

import type { LinkRolePermissionFormLabels } from "@/lib/i18n/label-builders";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { InlineAlert } from "@/components/app/inline-alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiJson } from "@/lib/api-client";

export function LinkRolePermissionForm({
  roles,
  permissions,
  labels,
}: {
  roles: Array<{ id: string; name: string }>;
  permissions: Array<{ id: string; code: string }>;
  labels: LinkRolePermissionFormLabels;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const roleId = String(fd.get("roleId") ?? "");
    const permissionId = String(fd.get("permissionId") ?? "");
    setPending(true);
    try {
      await apiJson("/api/role-permissions", {
        method: "POST",
        body: JSON.stringify({ roleId, permissionId }),
      });
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : labels.couldNotLink);
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex max-w-lg flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="grid gap-2">
        <Label htmlFor="roleId">{labels.role}</Label>
        <select
          id="roleId"
          name="roleId"
          required
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{labels.selectRole}</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="permissionId">{labels.permission}</Label>
        <select
          id="permissionId"
          name="permissionId"
          required
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{labels.selectPermission}</option>
          {permissions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.code}
            </option>
          ))}
        </select>
      </div>
      {error ? <InlineAlert>{error}</InlineAlert> : null}
      <Button type="submit" disabled={pending}>
        {pending ? labels.linkSaving : labels.linkSubmit}
      </Button>
    </form>
  );
}
