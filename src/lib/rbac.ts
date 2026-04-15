import type { Session } from "next-auth";

// ─── Role constants ────────────────────────────────────────────────────────────
// Existing DB roles (do not rename — matches seed data):
//   SUPER_ADMIN  – override everything
//   ADMIN        – department-admin: full access, peer-admin ownership isolation
//   MANAGER      – site-manager: own/assigned scope + delete
//   STAFF        – site-admin: own/assigned scope, no delete
//   SITE_ADMIN   – user-account manager only (no operational data access)

export const ROLE = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN:       "ADMIN",
  MANAGER:     "MANAGER",
  STAFF:       "STAFF",
  SITE_ADMIN:  "SITE_ADMIN",
} as const;

export type RoleName = (typeof ROLE)[keyof typeof ROLE];

// ─── Tier helpers ──────────────────────────────────────────────────────────────

export function isSuperAdmin(roleName: string | undefined): boolean {
  return roleName === ROLE.SUPER_ADMIN;
}

/** Full system admin (department-admin). */
export function isAdmin(roleName: string | undefined): boolean {
  return roleName === ROLE.ADMIN;
}

/** User-account manager only (no operational data). */
export function isSiteAdmin(roleName: string | undefined): boolean {
  return roleName === ROLE.SITE_ADMIN;
}

/** site-manager: own/assigned scope + delete. */
export function isManager(roleName: string | undefined): boolean {
  return roleName === ROLE.MANAGER;
}

/** site-admin (STAFF): own/assigned scope, no delete. */
export function isStaff(roleName: string | undefined): boolean {
  return roleName === ROLE.STAFF;
}

// ─── Operational access ────────────────────────────────────────────────────────

/**
 * Can the user access operational modules at all?
 * SITE_ADMIN is a user-account manager only — no tasks/malfunctions/reports.
 */
export function canAccessOperations(roleName: string | undefined): boolean {
  return (
    isSuperAdmin(roleName) ||
    isAdmin(roleName) ||
    isManager(roleName) ||
    isStaff(roleName)
  );
}

/**
 * Can the user access analytics (reports, achievements)?
 * Only ADMIN and above.
 */
export function canAccessAnalytics(roleName: string | undefined): boolean {
  return isSuperAdmin(roleName) || isAdmin(roleName);
}

// ─── Task / Malfunction visibility ────────────────────────────────────────────

/**
 * Returns a Prisma `where` fragment that scopes tasks to what the user may see.
 * ADMIN/SUPER_ADMIN → all tasks.
 * MANAGER/STAFF     → only tasks they created or are assigned to.
 */
export function taskVisibilityWhere(
  roleName: string | undefined,
  userId: string
): { createdByUserId?: string; assignmentToUserId?: string } | undefined {
  if (isSuperAdmin(roleName) || isAdmin(roleName)) {
    return undefined; // no filter — see all
  }
  // MANAGER and STAFF see only own/assigned
  return {
    OR: [
      { createdByUserId: userId },
      { assignmentToUserId: userId },
    ],
  } as never;
}

/**
 * Returns a Prisma `where` fragment that scopes malfunctions to what the user may see.
 */
export function malfunctionVisibilityWhere(
  roleName: string | undefined,
  userId: string
): { createdByUserId?: string; reporterUserId?: string } | undefined {
  if (isSuperAdmin(roleName) || isAdmin(roleName)) {
    return undefined;
  }
  return {
    OR: [
      { createdByUserId: userId },
      { reporterUserId: userId },
    ],
  } as never;
}

// ─── Edit / update checks ──────────────────────────────────────────────────────

export function canEditTask(
  roleName: string | undefined,
  userId: string,
  task: { createdByUserId: string; assignmentToUserId: string | null }
): boolean {
  if (isSuperAdmin(roleName) || isAdmin(roleName)) return true;
  // MANAGER and STAFF can edit own/assigned
  if (isManager(roleName) || isStaff(roleName)) {
    return task.createdByUserId === userId || task.assignmentToUserId === userId;
  }
  return false;
}

export function canEditMalfunction(
  roleName: string | undefined,
  userId: string,
  m: { createdByUserId: string; reporterUserId: string }
): boolean {
  if (isSuperAdmin(roleName) || isAdmin(roleName)) return true;
  if (isManager(roleName) || isStaff(roleName)) {
    return m.createdByUserId === userId || m.reporterUserId === userId;
  }
  return false;
}

export function canEditAchievement(
  roleName: string | undefined,
  userId: string,
  ownerUserId: string
): boolean {
  if (isSuperAdmin(roleName) || isAdmin(roleName)) return true;
  return ownerUserId === userId;
}

// ─── Delete checks ─────────────────────────────────────────────────────────────

/** STAFF (site-admin) cannot delete tasks. MANAGER and above can. */
export function canDeleteTask(
  roleName: string | undefined,
  userId: string,
  task: { createdByUserId: string; assignmentToUserId: string | null }
): boolean {
  if (isSuperAdmin(roleName)) return true;
  // ADMIN: can delete only own tasks (peer-admin ownership isolation)
  if (isAdmin(roleName)) return task.createdByUserId === userId;
  // MANAGER: can delete own/assigned
  if (isManager(roleName)) {
    return task.createdByUserId === userId || task.assignmentToUserId === userId;
  }
  // STAFF: cannot delete
  return false;
}

export function canDeleteMalfunction(
  roleName: string | undefined,
  userId: string,
  m: { createdByUserId: string; reporterUserId: string }
): boolean {
  if (isSuperAdmin(roleName)) return true;
  if (isAdmin(roleName)) return m.createdByUserId === userId;
  if (isManager(roleName)) {
    return m.createdByUserId === userId || m.reporterUserId === userId;
  }
  return false;
}

// ─── Admin / user management ───────────────────────────────────────────────────

/** Full system admin panel (roles, permissions, sites). */
export function canAccessAdminPanel(roleName: string | undefined): boolean {
  return isSuperAdmin(roleName) || isAdmin(roleName);
}

/** Manage user accounts (activate, deactivate, create, delete). */
export function canManageUserAccounts(roleName: string | undefined): boolean {
  return isSuperAdmin(roleName) || isAdmin(roleName) || isSiteAdmin(roleName);
}

/**
 * Peer-admin protection: an ADMIN cannot modify another ADMIN's account.
 * SUPER_ADMIN can modify anyone.
 */
export function canModifyTargetUser(
  actorRoleName: string | undefined,
  actorId: string,
  targetRoleName: string,
  targetId: string
): boolean {
  if (isSuperAdmin(actorRoleName)) return true;
  // ADMIN cannot touch another ADMIN (peer protection)
  if (isAdmin(actorRoleName) && isAdmin(targetRoleName) && actorId !== targetId) {
    return false;
  }
  // SITE_ADMIN cannot touch ADMIN accounts
  if (isSiteAdmin(actorRoleName) && isAdmin(targetRoleName)) {
    return false;
  }
  return true;
}

// ─── Account self-service ──────────────────────────────────────────────────────

/** Can the user update their own profile name? */
export function canUpdateOwnProfile(roleName: string | undefined): boolean {
  // STAFF (site-admin per spec) cannot update own name
  return !isStaff(roleName);
}

/** Can the user change their own password? */
export function canChangeOwnPassword(roleName: string | undefined): boolean {
  // STAFF (site-admin per spec) cannot change own password
  return !isStaff(roleName);
}

// ─── Legacy helpers (kept for backward compat) ────────────────────────────────

export function requireSession(session: Session | null): Session {
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session;
}

/** @deprecated Use canEditTask / canDeleteTask instead */
export function canManageAll(roleName: string): boolean {
  return isAdmin(roleName) || isManager(roleName) || isSuperAdmin(roleName);
}
