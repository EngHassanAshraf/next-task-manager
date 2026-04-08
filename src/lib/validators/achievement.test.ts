import { AchievementStatus, AchievementType } from "@/generated/prisma/client";
import { describe, expect, it } from "vitest";

import { achievementCreateSchema, targetMetricSchema } from "@/lib/validators/achievement";

describe("targetMetricSchema", () => {
  it("accepts metric and window", () => {
    const r = targetMetricSchema.safeParse({
      metric: "TASKS_CLOSED",
      window: "MONTH",
    });
    expect(r.success).toBe(true);
  });

  it("rejects unknown metric", () => {
    const r = targetMetricSchema.safeParse({ metric: "INVALID" });
    expect(r.success).toBe(false);
  });
});

describe("achievementCreateSchema", () => {
  it("accepts CUSTOM type with optional fields", () => {
    const r = achievementCreateSchema.safeParse({
      type: AchievementType.CUSTOM,
      title: "T",
      status: AchievementStatus.IN_PROGRESS,
    });
    expect(r.success).toBe(true);
  });

  it("accepts COMPUTED with targetMetric", () => {
    const r = achievementCreateSchema.safeParse({
      type: AchievementType.COMPUTED,
      title: "T",
      status: AchievementStatus.IN_PROGRESS,
      targetMetric: { metric: "TASKS_DONE", window: "DAY" },
    });
    expect(r.success).toBe(true);
  });
});
