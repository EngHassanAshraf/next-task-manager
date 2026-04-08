import { describe, expect, it } from "vitest";

import { siteAdminCannotManageAdminRole } from "@/lib/user-account-policy";

describe("siteAdminCannotManageAdminRole", () => {
  it("is true when actor is SITE_ADMIN and target role is ADMIN", () => {
    expect(siteAdminCannotManageAdminRole("SITE_ADMIN", "ADMIN")).toBe(true);
  });

  it("is false for full ADMIN actor", () => {
    expect(siteAdminCannotManageAdminRole("ADMIN", "ADMIN")).toBe(false);
  });

  it("is false when target is not ADMIN", () => {
    expect(siteAdminCannotManageAdminRole("SITE_ADMIN", "USER")).toBe(false);
  });
});
