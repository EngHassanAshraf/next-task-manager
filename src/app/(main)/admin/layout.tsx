import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { authOptions } from "@/lib/auth";
import { canManageUserAccounts } from "@/lib/rbac";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (!canManageUserAccounts(session.user.roleName)) {
    redirect("/tasks");
  }
  return children;
}
