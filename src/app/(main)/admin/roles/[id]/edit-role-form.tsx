"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { InlineAlert } from "@/components/app/inline-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiJson } from "@/lib/api-client";

type Permission = { id: string; code: string; description: string | null };

type Labels = {
  roleName: string;
  descriptionOptional: string;
  editPermissions: string;
  editPermissionsHint: string;
  save: string;
  saving: string;
  couldNotSave: string;
};

export function EditRoleForm({
  role,
  allPermissions,
  assignedPermissionIds,
  labels,
}: {
  role: { id: string; name: string; description: string | null };
  allPermissions: Permission[];
  assignedPermissionIds: string[];
  labels: Labels;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(assignedPermissionIds)
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const description = String(fd.get("description") ?? "").trim() || null;
    setPending(true);
    try {
      await apiJson(`/api/roles/${role.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name, description, permissionIds: [...selected] }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.couldNotSave);
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
        <Label htmlFor="name">{labels.roleName}</Label>
        <Input id="name" name="name" required defaultValue={role.name} maxLength={100} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">{labels.descriptionOptional}</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={role.description ?? ""}
          maxLength={500}
          rows={2}
        />
      </div>

      <div className="grid gap-2">
        <Label>{labels.editPermissions}</Label>
        <p className="text-xs text-muted-foreground">{labels.editPermissionsHint}</p>
        <div className="max-h-56 overflow-y-auto rounded-md border border-border p-2">
          {allPermissions.length === 0 ? (
            <span className="text-xs text-muted-foreground">—</span>
          ) : (
            allPermissions.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-muted/40"
              >
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={selected.has(p.id)}
                  onChange={() => toggle(p.id)}
                />
                <span className="font-mono text-xs">{p.code}</span>
                {p.description ? (
                  <span className="text-xs text-muted-foreground">— {p.description}</span>
                ) : null}
              </label>
            ))
          )}
        </div>
      </div>

      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <Button type="submit" disabled={pending}>
        {pending ? labels.saving : labels.save}
      </Button>
    </form>
  );
}
