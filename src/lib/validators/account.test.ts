import { describe, expect, it } from "vitest";

import { passwordPatchSchema, profilePatchSchema } from "@/lib/validators/account";

describe("account validators", () => {
  it("profilePatchSchema requires non-empty name", () => {
    expect(profilePatchSchema.safeParse({ name: "" }).success).toBe(false);
    expect(profilePatchSchema.safeParse({ name: "  " }).success).toBe(false);
    expect(profilePatchSchema.safeParse({ name: "Alice" }).success).toBe(true);
  });

  it("passwordPatchSchema requires currentPassword and min-length newPassword", () => {
    expect(
      passwordPatchSchema.safeParse({ currentPassword: "", newPassword: "12345678" }).success
    ).toBe(false);
    expect(
      passwordPatchSchema.safeParse({ currentPassword: "old", newPassword: "short" }).success
    ).toBe(false);
    expect(
      passwordPatchSchema.safeParse({ currentPassword: "old", newPassword: "longEnough123" }).success
    ).toBe(true);
  });
});

