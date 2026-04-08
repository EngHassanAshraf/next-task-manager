import { MalfunctionStatus } from "@/generated/prisma/client";
import { describe, expect, it } from "vitest";

import {
  malfunctionCreateSchema,
  malfunctionStatusPatchSchema,
  malfunctionUpdateSchema,
} from "@/lib/validators/malfunction";

describe("malfunctionCreateSchema", () => {
  it("accepts valid create payload", () => {
    const r = malfunctionCreateSchema.safeParse({
      title: "T",
      desc: "D",
      siteId: "s1",
      reporterUserId: "u1",
      status: MalfunctionStatus.OPENED_ON_TASK,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing title", () => {
    const r = malfunctionCreateSchema.safeParse({
      title: "",
      desc: "D",
      siteId: "s1",
      reporterUserId: "u1",
      status: MalfunctionStatus.OPENED_ON_TASK,
    });
    expect(r.success).toBe(false);
  });
});

describe("malfunctionUpdateSchema", () => {
  it("requires core fields when present", () => {
    const r = malfunctionUpdateSchema.safeParse({
      title: "New",
      desc: "D",
      siteId: "s",
      reporterUserId: "u",
    });
    expect(r.success).toBe(true);
  });
});

describe("malfunctionStatusPatchSchema", () => {
  it("accepts status only", () => {
    const r = malfunctionStatusPatchSchema.safeParse({
      status: MalfunctionStatus.CLOSED,
    });
    expect(r.success).toBe(true);
  });
});
