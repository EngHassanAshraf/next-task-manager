"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DataTableShell } from "@/components/app/data-table-shell";
import { EmptyState } from "@/components/app/empty-state";
import { InlineAlert } from "@/components/app/inline-alert";
import { Button } from "@/components/ui/button";
import { apiJson } from "@/lib/api-client";

type SessionRow = {
  id: string;
  createdAt: string;
  lastSeenAt: string;
  revokedAt: string | null;
  ip: string | null;
  userAgent: string | null;
  isCurrent: boolean;
};

type EventRow = {
  id: string;
  type: string;
  createdAt: string;
  ip: string | null;
  userAgent: string | null;
};

export function SecurityClient({ locale }: { locale: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [events, setEvents] = useState<EventRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const fmt = useMemo(() => {
    return (iso: string) =>
      new Date(iso).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
  }, [locale]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [s, e] = await Promise.all([
        apiJson<SessionRow[]>("/api/account/sessions"),
        apiJson<EventRow[]>("/api/account/events"),
      ]);
      setSessions(s);
      setEvents(e);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load security data");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function revokeOne(id: string) {
    setError(null);
    setBusy(id);
    try {
      const res = await apiJson<{ ok: boolean; isCurrent: boolean }>(`/api/account/sessions/${id}`, {
        method: "DELETE",
      });
      if (res.isCurrent) {
        await signOut({ callbackUrl: "/login" });
        return;
      }
      await load();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Revoke failed");
    } finally {
      setBusy(null);
    }
  }

  async function signOutOthers() {
    setError(null);
    setBusy("all");
    try {
      await apiJson("/api/account/sessions", { method: "DELETE" });
      await load();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign out failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-foreground">Sessions</h2>
          <Button variant="outline" disabled={busy === "all"} onClick={signOutOthers}>
            {busy === "all" ? "Working…" : "Sign out other sessions"}
          </Button>
        </div>

        <DataTableShell
          empty={
            sessions && sessions.length === 0 ? (
              <EmptyState title="No sessions found." />
            ) : undefined
          }
        >
          <table className="min-w-full text-start text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="border-b border-border px-3 py-2 font-medium">Device</th>
                <th className="border-b border-border px-3 py-2 font-medium">Last seen</th>
                <th className="border-b border-border px-3 py-2 font-medium">IP</th>
                <th className="border-b border-border px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(sessions ?? []).map((s) => (
                <tr key={s.id} className="border-b border-border/50">
                  <td className="px-3 py-2">
                    <div className="font-medium">
                      {s.isCurrent ? "Current session" : "Session"}
                      {s.revokedAt ? " (revoked)" : ""}
                    </div>
                    <div className="text-xs text-muted-foreground" dir="ltr">
                      {s.userAgent ? s.userAgent.slice(0, 80) : "—"}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{fmt(s.lastSeenAt)}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground" dir="ltr">
                    {s.ip ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={!!s.revokedAt || busy === s.id}
                      onClick={() => revokeOne(s.id)}
                    >
                      {busy === s.id ? "Revoking…" : s.isCurrent ? "Sign out" : "Revoke"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableShell>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Recent security events</h2>
        <DataTableShell
          empty={events && events.length === 0 ? <EmptyState title="No events yet." /> : undefined}
        >
          <table className="min-w-full text-start text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="border-b border-border px-3 py-2 font-medium">Event</th>
                <th className="border-b border-border px-3 py-2 font-medium">Time</th>
                <th className="border-b border-border px-3 py-2 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {(events ?? []).map((e) => (
                <tr key={e.id} className="border-b border-border/50">
                  <td className="px-3 py-2">{e.type}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{fmt(e.createdAt)}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground" dir="ltr">
                    {e.ip ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableShell>
      </section>
    </div>
  );
}

