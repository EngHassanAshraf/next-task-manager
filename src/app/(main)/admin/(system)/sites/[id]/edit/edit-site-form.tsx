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
  siteName: string;
  save: string;
  saving: string;
  saveFailed: string;
  backToSites: string;
};

export function EditSiteForm({
  site,
  labels,
}: {
  site: { id: string; name: string };
  labels: Labels;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const name = String(new FormData(e.currentTarget).get("name") ?? "").trim();
    setPending(true);
    try {
      await apiJson(`/api/sites/${site.id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      router.push("/admin/sites");
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
        <Label htmlFor="name">{labels.siteName}</Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={200}
          defaultValue={site.name}
          autoComplete="off"
        />
      </div>

      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? labels.saving : labels.save}
        </Button>
        <Button asChild variant="outline" type="button">
          <Link href="/admin/sites">{labels.backToSites}</Link>
        </Button>
      </div>
    </form>
  );
}
