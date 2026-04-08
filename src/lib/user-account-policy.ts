import { isAdmin, isSiteAdmin } from "@/lib/rbac";

/** SITE_ADMIN must not create or modify ADMIN accounts. */
export function siteAdminCannotManageAdminRole(
  actorRoleName: string | undefined,
  targetRoleName: string
): boolean {
  return isSiteAdmin(actorRoleName) && !isAdmin(actorRoleName) && targetRoleName === "ADMIN";
}
