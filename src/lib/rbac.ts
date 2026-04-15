import type { Session } from "next-auth";

export function requireSession(session: Session | null): Session {
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export function canManageAll(roleName: string): boolean {
  return roleName === "ADMIN" || roleName === "MANAGER";
}

export function canEditTask(
  roleName: string,
  userId: string,
  task: { createdByUserId: string; assignmentToUserId: string | null }
): boolean {
  if (canManageAll(roleName)) {
    return true;
  }
  return (
    task.createdByUserId === userId ||
    task.assignmentToUserId === userId
  );
}

export function canEditMalfunction(
  roleName: string,
  userId: string,
  m: { createdByUserId: string; reporterUserId: string }
): boolean {
  if (canManageAll(roleName)) {
    return true;
  }
  return m.createdByUserId === userId || m.reporterUserId === userId;
}

export function canEditAchievement(
  roleName: string,
  userId: string,
  ownerUserId: string
): boolean {
  if (canManageAll(roleName)) {
    return true;
  }
  return ownerUserId === userId;
}

/** Full admin: users, roles, permissions, sites */
export function isAdmin(roleName: string | undefined): boolean {
  return roleName === "ADMIN";
}

export function isSiteAdmin(roleName: string | undefined): boolean {
  return roleName === "SITE_ADMIN";
}

/** Create/manage user accounts (activate, deactivate, delete, activity). ADMIN or SITE_ADMIN. */
export function canManageUserAccounts(roleName: string | undefined): boolean {
  return isAdmin(roleName) || isSiteAdmin(roleName);
}
