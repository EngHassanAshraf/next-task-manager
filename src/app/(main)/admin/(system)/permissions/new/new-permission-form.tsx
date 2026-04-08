"use client";

import type { NewPermissionFormLabels } from "@/lib/i18n/label-builders";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { InlineAlert } from "@/components/app/inline-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiJson } from "@/lib/api-client";

export function NewPermissionForm({ labels }: { labels: NewPermissionFormLabels }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const code = String(fd.get("code") ?? "").trim();
    const description = String(fd.get("description") ?? "").trim();
    setPending(true);
    try {
      await apiJson("/api/permissions", {
        method: "POST",
        body: JSON.stringify({
          code,
          description: description || null,
        }),
      });
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : labels.couldNotCreatePermission);
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
        <Label htmlFor="code">{labels.permissionCode}</Label>
        <Input
          id="code"
          name="code"
          required
          autoComplete="off"
          placeholder={labels.permissionPlaceholder}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">{labels.descriptionOptional}</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>

      {error ? <InlineAlert>{error}</InlineAlert> : null}
      <Button type="submit" disabled={pending}>
        {pending ? labels.creating : labels.createPermission}
      </Button>
    </form>
  );
}
