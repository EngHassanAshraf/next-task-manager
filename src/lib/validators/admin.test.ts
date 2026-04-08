import { describe, expect, it } from "vitest";

import {
  permissionCreateSchema,
  roleCreateSchema,
  rolePermissionCreateSchema,
  siteCreateSchema,
  userCreateSchema,
  userStatusPatchSchema,
} from "@/lib/validators/admin";

describe("siteCreateSchema", () => {
  it("accepts non-empty trimmed name", () => {
    expect(siteCreateSchema.safeParse({ name: " Site A " }).success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(siteCreateSchema.safeParse({ name: "   " }).success).toBe(false);
  });
});

describe("userCreateSchema", () => {
  it("accepts valid email and password length", () => {
    const r = userCreateSchema.safeParse({
      email: "a@b.co",
      password: "12345678",
      roleId: "r1",
    });
    expect(r.success).toBe(true);
  });

  it("rejects short password", () => {
    const r = userCreateSchema.safeParse({
      email: "a@b.co",
      password: "short",
      roleId: "r1",
    });
    expect(r.success).toBe(false);
  });
});

describe("rolePermissionCreateSchema", () => {
  it("requires both ids", () => {
    expect(
      rolePermissionCreateSchema.safeParse({ roleId: "r", permissionId: "p" }).success
    ).toBe(true);
    expect(rolePermissionCreateSchema.safeParse({ roleId: "r" }).success).toBe(false);
  });
});

describe("userStatusPatchSchema", () => {
  it("accepts boolean active", () => {
    expect(userStatusPatchSchema.safeParse({ active: false }).success).toBe(true);
  });
});

describe("roleCreateSchema and permissionCreateSchema", () => {
  it("accepts minimal role", () => {
    expect(roleCreateSchema.safeParse({ name: "ROLE_A" }).success).toBe(true);
  });

  it("accepts permission code", () => {
    expect(permissionCreateSchema.safeParse({ code: "sites.view" }).success).toBe(true);
  });
});
