import { canModifyTargetUser, isAdmin } from "@/lib/rbac";

/**
 * @deprecated Use canModifyTargetUser() for full peer-admin protection.
 * Kept for backward compat with existing call sites.
 */
export function siteAdminCannotManageAdminRole(
  actorRoleName: string | undefined,
  targetRoleName: string
): boolean {
  // SITE_ADMIN cannot manage ADMIN accounts
  // ADMIN cannot manage other ADMIN accounts (peer protection)
  if (!actorRoleName) return false;
  if (isAdmin(actorRoleName) && isAdmin(targetRoleName)) return true;
  return !canModifyTargetUser(actorRoleName, "", targetRoleName, "other");
}
