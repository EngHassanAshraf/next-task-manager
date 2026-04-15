"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { InlineAlert } from "@/components/app/inline-alert";
import { DataTableShell } from "@/components/app/data-table-shell";
import { apiJson } from "@/lib/api-client";
import type { UsersAdminTableLabels } from "@/lib/i18n/label-builders";
import { isAdmin } from "@/lib/rbac";

export type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  roleName: string;
  active: boolean;
  deletedAt: string | null;
};

export function UsersAdminTable({
  users,
  currentUserId,
  actorRoleName,
  labels,
}: {
  users: UserRow[];
  currentUserId: string;
  actorRoleName: string;
  labels: UsersAdminTableLabels;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const actorIsAdmin = isAdmin(actorRoleName);

  function canMutateTarget(target: UserRow): boolean {
    if (target.deletedAt) return false;
    if (actorIsAdmin) return true;
    return target.roleName !== "ADMIN";
  }

  function canViewActivity(target: UserRow): boolean {
    return actorIsAdmin || target.roleName !== "ADMIN";
  }

  async function setActive(id: string, active: boolean) {
    setError(null);
    setBusyId(id);
    try {
      await apiJson(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : labels.updateFailed);
    } finally {
      setBusyId(null);
    }
  }

  async function removeUser(id: string) {
    if (!window.confirm(labels.confirmDeleteUser)) return;
    setError(null);
    setBusyId(id);
    try {
      await apiJson(`/api/users/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : labels.deleteFailed);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-3">
      {error ? <InlineAlert>{error}</InlineAlert> : null}
      <DataTableShell>
        <table className="min-w-full border-collapse text-start text-sm">
          <thead className="sticky top-0 z-10 bg-muted/40">
            <tr>
              <th className="border-b border-border px-3 py-2 font-medium">{labels.tableEmail}</th>
              <th className="border-b border-border px-3 py-2 font-medium">{labels.tableName}</th>
              <th className="border-b border-border px-3 py-2 font-medium">{labels.tableRole}</th>
              <th className="border-b border-border px-3 py-2 font-medium">{labels.tableStatus}</th>
              <th className="border-b border-border px-3 py-2 font-medium">{labels.tableActions}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              const busy = busyId === u.id;
              const statusLabel = u.deletedAt
                ? labels.statusDeleted
                : u.active
                  ? labels.statusActive
                  : labels.statusInactive;
              const mutate = canMutateTarget(u) && !isSelf;

              return (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-3 py-2 text-foreground">{u.email ?? labels.none}</td>
                  <td className="px-3 py-2 text-foreground">{u.name ?? labels.none}</td>
                  <td className="px-3 py-2 text-foreground">{u.roleName}</td>
                  <td className="px-3 py-2 text-muted-foreground">{statusLabel}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      {/* View detail */}
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {labels.view}
                      </Link>

                      {/* Edit */}
                      {mutate ? (
                        <Link
                          href={`/admin/users/${u.id}/edit`}
                          className="text-xs text-primary hover:underline"
                        >
                          {labels.edit}
                        </Link>
                      ) : null}

                      {/* Activity */}
                      {canViewActivity(u) ? (
                        <Link
                          href={`/admin/users/${u.id}/activity`}
                          className="text-xs text-primary hover:underline"
                        >
                          {labels.activity}
                        </Link>
                      ) : null}

                      {/* Deactivate */}
                      {mutate && !u.deletedAt && u.active ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setActive(u.id, false)}
                          className="text-xs text-warning hover:underline disabled:opacity-50"
                        >
                          {labels.deactivate}
                        </button>
                      ) : null}

                      {/* Activate */}
                      {mutate && !u.deletedAt && !u.active ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setActive(u.id, true)}
                          className="text-xs text-success hover:underline disabled:opacity-50"
                        >
                          {labels.activate}
                        </button>
                      ) : null}

                      {/* Delete */}
                      {mutate ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => removeUser(u.id)}
                          className="text-xs text-destructive hover:underline disabled:opacity-50"
                        >
                          {labels.delete}
                        </button>
                      ) : null}

                      {isSelf ? (
                        <span className="text-xs text-muted-foreground">{labels.you}</span>
                      ) : null}
                      {!mutate && !isSelf && !u.deletedAt && u.roleName === "ADMIN" && !actorIsAdmin ? (
                        <span className="text-xs text-muted-foreground">{labels.protected}</span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataTableShell>
    </div>
  );
}
