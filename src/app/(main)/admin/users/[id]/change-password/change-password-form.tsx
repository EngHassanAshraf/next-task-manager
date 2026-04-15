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
  newPassword: string;
  hint: string;
  change: string;
  changing: string;
  couldNotChange: string;
  successMessage: string;
  backToUser: string;
};

export function ChangePasswordForm({
  userId,
  labels,
  backHref,
}: {
  userId: string;
  labels: Labels;
  backHref: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const newPassword = String(fd.get("newPassword") ?? "");
    setPending(true);
    try {
      await apiJson(`/api/users/${userId}/change-password`, {
        method: "POST",
        body: JSON.stringify({ newPassword }),
      });
      setSuccess(true);
      setTimeout(() => router.push(backHref), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.couldNotChange);
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return <InlineAlert tone="success">{labels.successMessage}</InlineAlert>;
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="grid gap-2">
        <Label htmlFor="newPassword">{labels.newPassword}</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          maxLength={200}
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">{labels.hint}</p>
      </div>

      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? labels.changing : labels.change}
        </Button>
        <Button asChild variant="outline" type="button">
          <Link href={backHref}>{labels.backToUser}</Link>
        </Button>
      </div>
    </form>
  );
}
