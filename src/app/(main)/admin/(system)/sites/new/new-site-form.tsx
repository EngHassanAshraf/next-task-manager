"use client";

import type { NewSiteFormLabels } from "@/lib/i18n/label-builders";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { InlineAlert } from "@/components/app/inline-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiJson } from "@/lib/api-client";

export function NewSiteForm({ labels }: { labels: NewSiteFormLabels }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    setPending(true);
    try {
      await apiJson("/api/sites", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      router.push("/admin/sites");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : labels.couldNotCreateSite);
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
        <Label htmlFor="name">{labels.siteName}</Label>
        <Input id="name" name="name" required autoComplete="off" />
      </div>

      {error ? <InlineAlert>{error}</InlineAlert> : null}
      <Button type="submit" disabled={pending}>
        {pending ? labels.creating : labels.createSite}
      </Button>
    </form>
  );
}
