"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiJson } from "@/lib/api-client";
import type { EditTaskFormLabels } from "@/lib/i18n/label-builders";
import { TASK_STATUS, type TaskStatus } from "@/lib/constants";

export function EditTaskForm({
  task,
  sites,
  users,
  malfunctions,
  labels,
}: {
  task: {
    id: string;
    desc: string;
    siteId: string;
    assignmentToUserId: string | null;
    malfunctionId: string | null;
    status: TaskStatus;
    statusDetails: string | null;
  };
  sites: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string | null; email: string | null }>;
  malfunctions: Array<{ id: string; title: string; status: string }>;
  labels: EditTaskFormLabels;
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
      await apiJson(`/api/tasks/${task.id}`, {
        method: "PUT",
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
    } catch (error: any) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <label className="text-sm font-medium">
        {labels.description}
        <textarea
          name="desc"
          required
          rows={4}
          defaultValue={task.desc}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <label className="text-sm font-medium">
        {labels.site}
        <select
          name="siteId"
          required
          defaultValue={task.siteId}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        {labels.assignTo}
        <select
          name="assignmentToUserId"
          defaultValue={task.assignmentToUserId ?? ""}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">{labels.none}</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name ?? u.email}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        {labels.malfunctionOptional}
        <select
          name="malfunctionId"
          defaultValue={task.malfunctionId ?? ""}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">{labels.none}</option>
          {malfunctions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title} ({m.status})
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        {labels.status}
        <select
          name="status"
          defaultValue={task.status}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {TASK_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        {labels.statusDetails}
        <input
          name="statusDetails"
          defaultValue={task.statusDetails ?? ""}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? labels.saving : labels.save}
      </button>
    </form>
  );
}
