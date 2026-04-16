import { canModifyTargetUser } from "@/lib/rbac";

/** @deprecated Use canModifyTargetUser() directly. */
export function siteAdminCannotManageAdminRole(
  actorRoleName: string | undefined,
  targetRoleName: string
): boolean {
  if (!actorRoleName) return false;
  return !canModifyTargetUser(actorRoleName, "", targetRoleName, "other");
}
