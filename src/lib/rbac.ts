import type { Session } from "next-auth";

// ─── Role constants ────────────────────────────────────────────────────────────
// DB roles:
//   SUPER_ADMIN   – full override, system admin
//   DEP_ADMIN     – department admin: full access, peer-admin ownership isolation
//   SITE_MANAGER  – own/assigned scope + can delete
//   SITE_ADMIN    – own/assigned scope, no delete, no reports/admin

export const ROLE = {
  SUPER_ADMIN:  "SUPER_ADMIN",
  DEP_ADMIN:    "DEP_ADMIN",
  SITE_MANAGER: "SITE_MANAGER",
  SITE_ADMIN:   "SITE_ADMIN",
} as const;

export type RoleName = (typeof ROLE)[keyof typeof ROLE];

// ─── Tier helpers ──────────────────────────────────────────────────────────────

export function isSuperAdmin(r: string | undefined): boolean {
  return r === ROLE.SUPER_ADMIN;
}

export function isDepAdmin(r: string | undefined): boolean {
  return r === ROLE.DEP_ADMIN;
}

export function isSiteManager(r: string | undefined): boolean {
  return r === ROLE.SITE_MANAGER;
}

export function isSiteAdmin(r: string | undefined): boolean {
  return r === ROLE.SITE_ADMIN;
}

// ─── Access gates ──────────────────────────────────────────────────────────────

/** Tasks, malfunctions — all roles except none. */
export function canAccessOperations(r: string | undefined): boolean {
  return isSuperAdmin(r) || isDepAdmin(r) || isSiteManager(r) || isSiteAdmin(r);
}

/** Reports, achievements — DEP_ADMIN and above only. */
export function canAccessAnalytics(r: string | undefined): boolean {
  return isSuperAdmin(r) || isDepAdmin(r);
}

/** Admin panel entry — DEP_ADMIN and above. */
export function canAccessAdminPanel(r: string | undefined): boolean {
  return isSuperAdmin(r) || isDepAdmin(r);
}

/** User account management (create/edit/deactivate users). */
export function canManageUserAccounts(r: string | undefined): boolean {
  return isSuperAdmin(r) || isDepAdmin(r);
}

// ─── Visibility filters (Prisma where fragments) ──────────────────────────────

export function taskVisibilityWhere(
  r: string | undefined,
  userId: string
): object | undefined {
  if (isSuperAdmin(r) || isDepAdmin(r)) return undefined; // see all
  return { OR: [{ createdByUserId: userId }, { assignmentToUserId: userId }] };
}

export function malfunctionVisibilityWhere(
  r: string | undefined,
  userId: string
): object | undefined {
  if (isSuperAdmin(r) || isDepAdmin(r)) return undefined;
  return { OR: [{ createdByUserId: userId }, { reporterUserId: userId }] };
}

// ─── Edit checks ──────────────────────────────────────────────────────────────

export function canEditTask(
  r: string | undefined,
  userId: string,
  task: { createdByUserId: string; assignmentToUserId: string | null }
): boolean {
  if (isSuperAdmin(r) || isDepAdmin(r)) return true;
  if (isSiteManager(r) || isSiteAdmin(r)) {
    return task.createdByUserId === userId || task.assignmentToUserId === userId;
  }
  return false;
}

export function canEditMalfunction(
  r: string | undefined,
  userId: string,
  m: { createdByUserId: string; reporterUserId: string }
): boolean {
  if (isSuperAdmin(r) || isDepAdmin(r)) return true;
  if (isSiteManager(r) || isSiteAdmin(r)) {
    return m.createdByUserId === userId || m.reporterUserId === userId;
  }
  return false;
}

export function canEditAchievement(
  r: string | undefined,
  userId: string,
  ownerUserId: string
): boolean {
  if (isSuperAdmin(r) || isDepAdmin(r)) return true;
  return ownerUserId === userId;
}

// ─── Delete checks ─────────────────────────────────────────────────────────────

/** SITE_ADMIN cannot delete. SITE_MANAGER can delete own/assigned. DEP_ADMIN own only (peer isolation). */
export function canDeleteTask(
  r: string | undefined,
  userId: string,
  task: { createdByUserId: string; assignmentToUserId: string | null }
): boolean {
  if (isSuperAdmin(r)) return true;
  if (isDepAdmin(r)) return task.createdByUserId === userId; // peer isolation
  if (isSiteManager(r)) {
    return task.createdByUserId === userId || task.assignmentToUserId === userId;
  }
  return false; // SITE_ADMIN
}

export function canDeleteMalfunction(
  r: string | undefined,
  userId: string,
  m: { createdByUserId: string; reporterUserId: string }
): boolean {
  if (isSuperAdmin(r)) return true;
  if (isDepAdmin(r)) return m.createdByUserId === userId;
  if (isSiteManager(r)) {
    return m.createdByUserId === userId || m.reporterUserId === userId;
  }
  return false;
}

// ─── User management ──────────────────────────────────────────────────────────

/**
 * Peer-admin protection: DEP_ADMIN cannot modify another DEP_ADMIN.
 * SUPER_ADMIN can modify anyone.
 */
export function canModifyTargetUser(
  actorRole: string | undefined,
  actorId: string,
  targetRole: string,
  targetId: string
): boolean {
  if (isSuperAdmin(actorRole)) return true;
  // DEP_ADMIN cannot touch another DEP_ADMIN
  if (isDepAdmin(actorRole) && isDepAdmin(targetRole) && actorId !== targetId) return false;
  // DEP_ADMIN cannot touch SUPER_ADMIN
  if (isDepAdmin(actorRole) && isSuperAdmin(targetRole)) return false;
  return true;
}

// ─── Account self-service ──────────────────────────────────────────────────────

export function canUpdateOwnProfile(r: string | undefined): boolean {
  return canAccessOperations(r) || canManageUserAccounts(r);
}

export function canChangeOwnPassword(r: string | undefined): boolean {
  return canAccessOperations(r) || canManageUserAccounts(r);
}

// ─── Legacy shim ──────────────────────────────────────────────────────────────

export function requireSession(session: Session | null): Session {
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session;
}

/** @deprecated */
export function isAdmin(r: string | undefined): boolean {
  return isDepAdmin(r);
}

/** @deprecated */
export function canManageAll(r: string): boolean {
  return isDepAdmin(r) || isSiteManager(r) || isSuperAdmin(r);
}
