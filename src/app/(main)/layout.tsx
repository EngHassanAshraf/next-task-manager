import { getServerSession } from "next-auth";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { AppNav } from "@/components/app-nav";
import { hashSessionToken } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (!session.user.sessionId) {
    redirect("/login");
  }
  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { active: true, deletedAt: true },
  });
  if (!account || !account.active || account.deletedAt) {
    redirect(
      `/api/auth/signout?callbackUrl=${encodeURIComponent("/login?reason=inactive")}`
    );
  }

  const tokenHash = hashSessionToken(session.user.sessionId);
  const authSession = await prisma.authSession.findUnique({
    where: { sessionTokenHash: tokenHash },
    select: { revokedAt: true },
  });
  if (!authSession || authSession.revokedAt) {
    redirect(`/api/auth/signout?callbackUrl=${encodeURIComponent("/login")}`);
  }
  // Best-effort “last seen” update (do not block rendering if it fails).
  prisma.authSession
    .update({
      where: { sessionTokenHash: tokenHash },
      data: { lastSeenAt: new Date() },
    })
    .catch(() => null);
  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}
