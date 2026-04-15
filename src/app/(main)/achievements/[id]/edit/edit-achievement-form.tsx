"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiJson } from "@/lib/api-client";
import type { EditAchievementFormLabels } from "@/lib/i18n/label-builders";
import {
  ACHIEVEMENT_STATUS,
  type AchievementStatus,
  type AchievementType,
} from "@/lib/constants";

export function EditAchievementForm({
  achievement,
  sites,
  labels,
}: {
  achievement: {
    id: string;
    type: AchievementType;
    title: string;
    desc: string | null;
    siteId: string | null;
    status: AchievementStatus;
    actualValue: number | null;
  };
  sites: Array<{ id: string; name: string }>;
  labels: EditAchievementFormLabels;
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
    const siteId = String(fd.get("siteId") ?? "").trim();
    const status = String(fd.get("status") ?? "IN_PROGRESS") as AchievementStatus;
    const actualRaw = String(fd.get("actualValue") ?? "").trim();

    setPending(true);
    try {
      await apiJson(`/api/achievements/${achievement.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          desc: desc || null,
          siteId: siteId || null,
          status,
          actualValue:
            achievement.type === "CUSTOM"
              ? actualRaw === ""
                ? null
                : Number(actualRaw)
              : undefined,
        }),
      });
      router.push(`/achievements/${achievement.id}`);
      router.refresh();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-xs text-zinc-500">
        {labels.typeLocked.replace("{type}", achievement.type)}
      </p>
      <label className="text-sm font-medium">
        {labels.formTitle}
        <input
          name="title"
          required
          defaultValue={achievement.title}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <label className="text-sm font-medium">
        {labels.description}
        <textarea
          name="desc"
          rows={3}
          defaultValue={achievement.desc ?? ""}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <label className="text-sm font-medium">
        {labels.formSiteScope}
        <select
          name="siteId"
          defaultValue={achievement.siteId ?? ""}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">{labels.allSites}</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        {labels.status}
        <select
          name="status"
          defaultValue={achievement.status}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {ACHIEVEMENT_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      {achievement.type === "CUSTOM" ? (
        <label className="text-sm font-medium">
          {labels.formActualValue}
          <input
            name="actualValue"
            type="number"
            step="any"
            defaultValue={achievement.actualValue ?? ""}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      ) : null}
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
