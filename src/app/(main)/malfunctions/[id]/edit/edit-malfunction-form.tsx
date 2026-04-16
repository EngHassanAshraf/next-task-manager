"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiJson } from "@/lib/api-client";
import type { EditMalfunctionFormLabels } from "@/lib/i18n/label-builders";
import { MALFUNCTION_STATUS, type MalfunctionStatus } from "@/lib/constants";

export function EditMalfunctionForm({
  malfunction,
  sites,
  users,
  tasks,
  labels,
}: {
  malfunction: {
    id: string;
    title: string;
    desc: string;
    siteId: string;
    reporterUserId: string;
    taskId: string | null;
    status: MalfunctionStatus;
  };
  sites: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string | null; email: string | null }>;
  tasks: Array<{ id: string; desc: string; status: string }>;
  labels: EditMalfunctionFormLabels;
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
      await apiJson(`/api/malfunctions/${malfunction.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          desc,
          siteId,
          reporterUserId,
          taskId: taskId || null,
          status,
        }),
      });
      router.push(`/malfunctions/${malfunction.id}`);
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
        {labels.title}
        <input
          name="title"
          required
          defaultValue={malfunction.title}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <label className="text-sm font-medium">
        {labels.description}
        <textarea
          name="desc"
          required
          rows={4}
          defaultValue={malfunction.desc}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <label className="text-sm font-medium">
        {labels.site}
        <select
          name="siteId"
          required
          defaultValue={malfunction.siteId}
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
        {labels.reporter}
        <select
          name="reporterUserId"
          required
          defaultValue={malfunction.reporterUserId}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name ?? u.email}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        {labels.taskOptional}
        <select
          name="taskId"
          defaultValue={malfunction.taskId ?? ""}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">{labels.none}</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.desc.slice(0, 60)}
              {t.desc.length > 60 ? "…" : ""} ({t.status})
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        {labels.status}
        <select
          name="status"
          defaultValue={malfunction.status}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {MALFUNCTION_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
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
