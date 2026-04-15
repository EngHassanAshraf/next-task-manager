"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { InlineAlert } from "@/components/app/inline-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiJson } from "@/lib/api-client";

type Labels = {
  code: string;
  codePlaceholder: string;
  descriptionOptional: string;
  save: string;
  saving: string;
  saveFailed: string;
  backToPermissions: string;
};

export function EditPermissionForm({
  permission,
  labels,
}: {
  permission: { id: string; code: string; description: string | null };
  labels: Labels;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const code = String(fd.get("code") ?? "").trim();
    const description = String(fd.get("description") ?? "").trim() || null;
    setPending(true);
    try {
      await apiJson(`/api/permissions/${permission.id}`, {
        method: "PUT",
        body: JSON.stringify({ code, description }),
      });
      router.push("/admin/permissions");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.saveFailed);
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
        <Label htmlFor="code">{labels.code}</Label>
        <Input
          id="code"
          name="code"
          required
          maxLength={200}
          defaultValue={permission.code}
          placeholder={labels.codePlaceholder}
          autoComplete="off"
          className="font-mono"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">{labels.descriptionOptional}</Label>
        <Textarea
          id="description"
          name="description"
          maxLength={500}
          defaultValue={permission.description ?? ""}
          rows={2}
        />
      </div>

      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? labels.saving : labels.save}
        </Button>
        <Button asChild variant="outline" type="button">
          <Link href="/admin/permissions">{labels.backToPermissions}</Link>
        </Button>
      </div>
    </form>
  );
}
