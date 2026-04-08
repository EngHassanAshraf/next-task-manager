"use client";

import type { NewUserFormLabels } from "@/lib/i18n/label-builders";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { InlineAlert } from "@/components/app/inline-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiJson } from "@/lib/api-client";

export function NewUserForm({
  roles,
  labels,
}: {
  roles: Array<{ id: string; name: string }>;
  labels: NewUserFormLabels;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const name = String(fd.get("name") ?? "").trim();
    const roleId = String(fd.get("roleId") ?? "");
    setPending(true);
    try {
      await apiJson("/api/users", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          name: name || null,
          roleId,
        }),
      });
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : labels.couldNotCreateUser);
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
        <Label htmlFor="email">{labels.email}</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">{labels.passwordHint}</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="name">{labels.displayNameOptional}</Label>
        <Input id="name" name="name" autoComplete="name" />
      </div>
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

      {error ? <InlineAlert>{error}</InlineAlert> : null}
      <Button type="submit" disabled={pending}>
        {pending ? labels.creating : labels.createUser}
      </Button>
    </form>
  );
}
