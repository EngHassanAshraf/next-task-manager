import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";

export default async function SystemAdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (!isAdmin(session.user.roleName)) {
    redirect("/admin");
  }
  return children;
}
