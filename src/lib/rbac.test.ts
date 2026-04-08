import type { Session } from "next-auth";
import { describe, expect, it } from "vitest";

import {
  canEditAchievement,
  canEditMalfunction,
  canEditTask,
  canManageAll,
  canManageUserAccounts,
  canManageUsers,
  isAdmin,
  isSiteAdmin,
  requireSession,
} from "@/lib/rbac";

describe("canManageAll", () => {
  it("is true for ADMIN and MANAGER", () => {
    expect(canManageAll("ADMIN")).toBe(true);
    expect(canManageAll("MANAGER")).toBe(true);
  });

  it("is false for other roles", () => {
    expect(canManageAll("SITE_ADMIN")).toBe(false);
    expect(canManageAll("USER")).toBe(false);
  });
});

describe("canEditTask", () => {
  const task = {
    createdByUserId: "creator",
    assignmentToUserId: "assignee" as string | null,
  };

  it("allows ADMIN without ownership", () => {
    expect(canEditTask("ADMIN", "other", task)).toBe(true);
  });

  it("allows creator and assignee for non-manager", () => {
    expect(canEditTask("USER", "creator", task)).toBe(true);
    expect(canEditTask("USER", "assignee", task)).toBe(true);
  });

  it("denies unrelated user", () => {
    expect(canEditTask("USER", "stranger", task)).toBe(false);
  });
});

describe("canEditMalfunction", () => {
  const m = { createdByUserId: "c", reporterUserId: "r" };

  it("allows reporter for non-manager", () => {
    expect(canEditMalfunction("USER", "r", m)).toBe(true);
  });

  it("denies unrelated user", () => {
    expect(canEditMalfunction("USER", "x", m)).toBe(false);
  });
});

describe("canEditAchievement", () => {
  it("allows owner when not manager", () => {
    expect(canEditAchievement("USER", "u1", "u1")).toBe(true);
  });

  it("denies non-owner", () => {
    expect(canEditAchievement("USER", "u1", "u2")).toBe(false);
  });
});

describe("isAdmin / isSiteAdmin / canManageUsers / canManageUserAccounts", () => {
  it("identifies admin and site admin", () => {
    expect(isAdmin("ADMIN")).toBe(true);
    expect(isAdmin("MANAGER")).toBe(false);
    expect(isSiteAdmin("SITE_ADMIN")).toBe(true);
    expect(canManageUsers("ADMIN")).toBe(true);
    expect(canManageUsers("SITE_ADMIN")).toBe(false);
    expect(canManageUserAccounts("ADMIN")).toBe(true);
    expect(canManageUserAccounts("SITE_ADMIN")).toBe(true);
    expect(canManageUserAccounts("USER")).toBe(false);
  });
});

describe("requireSession", () => {
  it("throws when unauthenticated", () => {
    expect(() => requireSession(null)).toThrow("UNAUTHORIZED");
  });

  it("returns session when user id present", () => {
    const s = { user: { id: "1", name: "n" } } as Session;
    expect(requireSession(s)).toBe(s);
  });
});
