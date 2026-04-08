"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { InlineAlert } from "@/components/app/inline-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiJson } from "@/lib/api-client";
import type { NewAchievementFormLabels } from "@/lib/i18n/label-builders";
import {
  ACHIEVEMENT_STATUS,
  type AchievementStatus,
  type AchievementType,
} from "@/lib/constants";

export function NewAchievementForm({
  sites,
  labels,
}: {
  sites: Array<{ id: string; name: string }>;
  labels: NewAchievementFormLabels;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [kind, setKind] = useState<AchievementType>("CUSTOM");

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
    const metric = String(fd.get("metric") ?? "TASKS_CLOSED");
    const window = String(fd.get("window") ?? "MONTH");

    const body: Record<string, unknown> = {
      type: kind,
      title,
      desc: desc || null,
      siteId: siteId || null,
      status,
    };

    if (kind === "CUSTOM") {
      body.actualValue = actualRaw === "" ? null : Number(actualRaw);
    } else {
      body.targetMetric = {
        metric,
        window,
      };
    }

    setPending(true);
    try {
      const row = await apiJson<{ id: string }>("/api/achievements", {
        method: "POST",
        body: JSON.stringify(body),
      });
      router.push(`/achievements/${row.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : labels.couldNotCreate);
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
        <Label>{labels.formType}</Label>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as AchievementType)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="CUSTOM">{labels.formTypeCustom}</option>
          <option value="COMPUTED">{labels.formTypeComputed}</option>
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="title">{labels.formTitle}</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="desc">{labels.description}</Label>
        <Textarea id="desc" name="desc" rows={3} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="siteId">{labels.formSiteScope}</Label>
        <select
          id="siteId"
          name="siteId"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{labels.allSites}</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {kind === "COMPUTED" ? (
        <>
          <div className="grid gap-2">
            <Label htmlFor="metric">{labels.metric}</Label>
            <select
              id="metric"
              name="metric"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="TASKS_DONE">{labels.metricTasksDone}</option>
              <option value="TASKS_CLOSED">{labels.metricTasksClosed}</option>
              <option value="MALFUNCTIONS_CLOSED">{labels.metricMalfunctionsClosed}</option>
              <option value="MALFUNCTIONS_DONE_ON_TASK">{labels.metricMalfunctionsDoneOnTask}</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="window">{labels.timeWindow}</Label>
            <select
              id="window"
              name="window"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="DAY">{labels.windowDay}</option>
              <option value="WEEK">{labels.windowWeek}</option>
              <option value="MONTH">{labels.windowMonth}</option>
              <option value="ALL">{labels.windowAll}</option>
            </select>
          </div>
        </>
      ) : (
        <div className="grid gap-2">
          <Label htmlFor="actualValue">{labels.formActualValue}</Label>
          <Input
            id="actualValue"
            name="actualValue"
            type="number"
            step="any"
            placeholder={labels.formActualPlaceholder}
          />
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="status">{labels.status}</Label>
        <select
          id="status"
          name="status"
          defaultValue="IN_PROGRESS"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {ACHIEVEMENT_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error ? <InlineAlert>{error}</InlineAlert> : null}
      <Button type="submit" disabled={pending}>
        {pending ? labels.creating : labels.create}
      </Button>
    </form>
  );
}
