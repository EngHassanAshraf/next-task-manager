"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { InlineAlert } from "@/components/app/inline-alert";
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
    if (!window.confirm(labels.confirmDeleteUser)) {
      return;
    }
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
      {error ? (
        <InlineAlert>{error}</InlineAlert>
      ) : null}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full text-start text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50">
            <tr>
              <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">{labels.tableEmail}</th>
              <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">{labels.tableName}</th>
              <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">{labels.tableRole}</th>
              <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">{labels.tableStatus}</th>
              <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">{labels.tableActions}</th>
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
                <tr key={u.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-3 py-2">{u.email ?? labels.none}</td>
                  <td className="px-3 py-2">{u.name ?? labels.none}</td>
                  <td className="px-3 py-2">{u.roleName}</td>
                  <td className="px-3 py-2">{statusLabel}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      {canViewActivity(u) ? (
                        <Link
                          href={`/admin/users/${u.id}/activity`}
                          className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {labels.activity}
                        </Link>
                      ) : (
                        <span className="text-xs text-zinc-400">{labels.none}</span>
                      )}
                      {mutate && !u.deletedAt && u.active ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setActive(u.id, false)}
                          className="text-xs text-amber-700 hover:underline disabled:opacity-50 dark:text-amber-400"
                        >
                          {labels.deactivate}
                        </button>
                      ) : null}
                      {mutate && !u.deletedAt && !u.active ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setActive(u.id, true)}
                          className="text-xs text-green-700 hover:underline disabled:opacity-50 dark:text-green-400"
                        >
                          {labels.activate}
                        </button>
                      ) : null}
                      {mutate ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => removeUser(u.id)}
                          className="text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                        >
                          {labels.delete}
                        </button>
                      ) : null}
                      {isSelf ? (
                        <span className="text-xs text-zinc-400">{labels.you}</span>
                      ) : null}
                      {!mutate && !isSelf && !u.deletedAt && u.roleName === "ADMIN" && !actorIsAdmin ? (
                        <span className="text-xs text-zinc-400">{labels.protected}</span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
