import { TaskStatus } from "@/generated/prisma/client";
import { describe, expect, it } from "vitest";

import { taskCreateSchema, taskStatusPatchSchema } from "@/lib/validators/task";

describe("taskCreateSchema", () => {
  it("accepts minimal valid payload", () => {
    const r = taskCreateSchema.safeParse({
      desc: "Do work",
      siteId: "site1",
      status: TaskStatus.NEW,
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty desc", () => {
    const r = taskCreateSchema.safeParse({
      desc: "",
      siteId: "s",
      status: TaskStatus.NEW,
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const r = taskCreateSchema.safeParse({
      desc: "x",
      siteId: "s",
      status: "NOT_A_STATUS",
    });
    expect(r.success).toBe(false);
  });
});

describe("taskStatusPatchSchema", () => {
  it("accepts status and optional details", () => {
    const r = taskStatusPatchSchema.safeParse({
      status: TaskStatus.DONE,
      statusDetails: null,
    });
    expect(r.success).toBe(true);
  });
});
