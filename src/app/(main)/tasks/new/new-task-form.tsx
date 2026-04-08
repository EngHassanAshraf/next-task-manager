"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { InlineAlert } from "@/components/app/inline-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiJson } from "@/lib/api-client";
import type { TaskFormLabels } from "@/lib/i18n/label-builders";
import { TASK_STATUS, type TaskStatus } from "@/lib/constants";

export function NewTaskForm({
  sites,
  users,
  malfunctions,
  labels,
}: {
  sites: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string | null; email: string | null }>;
  malfunctions: Array<{ id: string; title: string; status: string }>;
  labels: TaskFormLabels;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const desc = String(fd.get("desc") ?? "").trim();
    const siteId = String(fd.get("siteId") ?? "");
    const assignmentToUserId = String(fd.get("assignmentToUserId") ?? "");
    const malfunctionId = String(fd.get("malfunctionId") ?? "").trim();
    const status = String(fd.get("status") ?? "NEW") as TaskStatus;
    const statusDetails = String(fd.get("statusDetails") ?? "").trim();

    setPending(true);
    try {
      const task = await apiJson<{ id: string }>("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
        desc,
        siteId,
        assignmentToUserId: assignmentToUserId || null,
        malfunctionId: malfunctionId || null,
        status,
        statusDetails: statusDetails || null,
        }),
      });
      router.push(`/tasks/${task.id}`);
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
        <Label htmlFor="assignmentToUserId">{labels.assignTo}</Label>
        <select
          id="assignmentToUserId"
          name="assignmentToUserId"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{labels.none}</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name ?? u.email}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="malfunctionId">{labels.malfunctionOptional}</Label>
        <select
          id="malfunctionId"
          name="malfunctionId"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{labels.none}</option>
          {malfunctions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title} ({m.status})
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="status">{labels.status}</Label>
        <select
          id="status"
          name="status"
          defaultValue="NEW"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {TASK_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="statusDetails">{labels.statusDetails}</Label>
        <Input id="statusDetails" name="statusDetails" />
      </div>

      {error ? <InlineAlert>{error}</InlineAlert> : null}
      <Button
        type="submit"
        disabled={pending}
      >
        {pending ? labels.creating : labels.createTask}
      </Button>
    </form>
  );
}
