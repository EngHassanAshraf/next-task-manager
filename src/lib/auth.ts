import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";
import { getClientIp, hashSessionToken, newSessionId } from "@/lib/auth-session";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req: { headers?: Record<string, string> } | undefined) {
        console.log("[NextAuth] authorize called with email:", credentials?.email);
        const email = credentials?.email?.trim();
        const password = credentials?.password;
        if (!email || !password) {
          console.log("[NextAuth] Missing email or password");
          return null;
        }
        try {
          const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true },
          });
          console.log("[NextAuth] User lookup result:", user ? { id: user.id, email: user.email, active: user.active, deletedAt: user.deletedAt, hasPasswordHash: !!user.passwordHash, roleId: user.roleId, hasRole: !!user.role } : null);
          if (!user?.passwordHash || !user.active || user.deletedAt) {
            console.log("[NextAuth] User failed validation - hasPasswordHash:", !!user?.passwordHash, "active:", user?.active, "deletedAt:", user?.deletedAt);
            await prisma.authEvent.create({
              data: {
                userId: user?.id ?? null,
                type: "SIGN_IN_FAILED",
                ip: req ? getClientIp(req.headers) : null,
                userAgent: req?.headers?.["user-agent"] ?? null,
                meta: { email },
              },
            });
            return null;
          }
          const ok = await bcrypt.compare(password, user.passwordHash);
          console.log("[NextAuth] Password comparison result:", ok);
          if (!ok) {
            await prisma.authEvent.create({
              data: {
                userId: user.id,
                type: "SIGN_IN_FAILED",
                ip: req ? getClientIp(req.headers) : null,
                userAgent: req?.headers?.["user-agent"] ?? null,
                meta: { email },
              },
            });
            return null;
          }
          const sessionId = newSessionId();
          await prisma.authSession.create({
            data: {
              userId: user.id,
              sessionTokenHash: hashSessionToken(sessionId),
              ip: req ? getClientIp(req.headers) : null,
              userAgent: req?.headers?.["user-agent"] ?? null,
            },
          });
          await prisma.authEvent.create({
            data: {
              userId: user.id,
              type: "SIGN_IN_SUCCESS",
              ip: req ? getClientIp(req.headers) : null,
              userAgent: req?.headers?.["user-agent"] ?? null,
            },
          });
          console.log("[NextAuth] Login successful for user:", user.id);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            roleId: user.roleId,
            roleName: user.role.name,
            sessionId,
          };
        } catch (error) {
          console.error("[NextAuth] Error during authorization:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const u = user as unknown as { roleId?: string; roleName?: string; sessionId?: string };
        token.roleId = u.roleId ?? "";
        token.roleName = u.roleName ?? "STAFF";
        token.sessionId = u.sessionId ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "";
        session.user.roleId = (token.roleId as string) ?? "";
        session.user.roleName = (token.roleName as string) ?? "STAFF";
        session.user.sessionId = (token.sessionId as string) ?? "";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
