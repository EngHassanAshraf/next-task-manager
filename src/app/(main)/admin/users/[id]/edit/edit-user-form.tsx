"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { InlineAlert } from "@/components/app/inline-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiJson } from "@/lib/api-client";

type Labels = {
  name: string;
  email: string;
  role: string;
  selectRole: string;
  activeStatus: string;
  save: string;
  saving: string;
  couldNotSave: string;
  backToUser: string;
};

export function EditUserForm({
  user,
  roles,
  labels,
  backHref,
}: {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    roleId: string;
    active: boolean;
    deletedAt: string | null;
  };
  roles: Array<{ id: string; name: string }>;
  labels: Labels;
  backHref: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim() || null;
    const email = String(fd.get("email") ?? "").trim();
    const roleId = String(fd.get("roleId") ?? "");
    const active = fd.get("active") === "on";
    setPending(true);
    try {
      await apiJson(`/api/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({ name, email, roleId, active }),
      });
      router.push(backHref);
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
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="grid gap-2">
        <Label htmlFor="name">{labels.name}</Label>
        <Input id="name" name="name" defaultValue={user.name ?? ""} maxLength={200} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">{labels.email}</Label>
        <Input id="email" name="email" type="email" required defaultValue={user.email ?? ""} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="roleId">{labels.role}</Label>
        <select
          id="roleId"
          name="roleId"
          required
          defaultValue={user.roleId}
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

      {/* Cannot toggle active on a deleted user */}
      {!user.deletedAt ? (
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="active"
            defaultChecked={user.active}
            className="accent-primary"
          />
          {labels.activeStatus}
        </label>
      ) : null}

      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? labels.saving : labels.save}
        </Button>
        <Button asChild variant="outline" type="button">
          <Link href={backHref}>{labels.backToUser}</Link>
        </Button>
      </div>
    </form>
  );
}
