"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { InlineAlert } from "@/components/app/inline-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiJson } from "@/lib/api-client";
import type { MalfunctionFormLabels } from "@/lib/i18n/label-builders";
import { MALFUNCTION_STATUS, type MalfunctionStatus } from "@/lib/constants";

export function NewMalfunctionForm({
  sites,
  users,
  tasks,
  labels,
}: {
  sites: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string | null; email: string | null }>;
  tasks: Array<{ id: string; desc: string; status: string }>;
  labels: MalfunctionFormLabels;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = String(fd.get("title") ?? "").trim();
    const desc = String(fd.get("desc") ?? "").trim();
    const siteId = String(fd.get("siteId") ?? "");
    const reporterUserId = String(fd.get("reporterUserId") ?? "");
    const taskId = String(fd.get("taskId") ?? "").trim();
    const status = String(fd.get("status") ?? "OPENED_ON_TASK") as MalfunctionStatus;

    setPending(true);
    try {
      const row = await apiJson<{ id: string }>("/api/malfunctions", {
        method: "POST",
        body: JSON.stringify({
        title,
        desc,
        siteId,
        reporterUserId,
        taskId: taskId || null,
        status,
        }),
      });
      router.push(`/malfunctions/${row.id}`);
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : labels.couldNotCreate;
      setError(message || labels.couldNotCreate);
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
        <Label htmlFor="title">{labels.title}</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="desc">{labels.description}</Label>
        <Textarea id="desc" name="desc" required rows={4} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="siteId">{labels.site}</Label>
        <select
          id="siteId"
          name="siteId"
          required
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="reporterUserId">{labels.reporter}</Label>
        <select
          id="reporterUserId"
          name="reporterUserId"
          required
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name ?? u.email}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="taskId">{labels.taskOptional}</Label>
        <select
          id="taskId"
          name="taskId"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{labels.none}</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.desc.slice(0, 60)}
              {t.desc.length > 60 ? "…" : ""} ({t.status})
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="status">{labels.status}</Label>
        <select
          id="status"
          name="status"
          defaultValue="OPENED_ON_TASK"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {MALFUNCTION_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error ? <InlineAlert>{error}</InlineAlert> : null}
      <Button
        type="submit"
        disabled={pending}
      >
        {pending ? labels.creating : labels.create}
      </Button>
    </form>
  );
}
