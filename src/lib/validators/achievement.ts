import { AchievementStatus, AchievementType } from "@/generated/prisma/client";
import { z } from "zod";

export const targetMetricSchema = z
  .object({
    metric: z.enum([
      "TASKS_DONE",
      "TASKS_CLOSED",
      "MALFUNCTIONS_CLOSED",
      "MALFUNCTIONS_DONE_ON_TASK",
    ]),
    target: z.number().positive().optional(),
    window: z.enum(["DAY", "WEEK", "MONTH", "ALL"]).optional(),
    siteIds: z.array(z.string()).optional(),
  })
  .passthrough();

export const achievementCreateSchema = z.object({
  type: z.nativeEnum(AchievementType),
  title: z.string().min(1),
  desc: z.string().nullable().optional(),
  siteId: z.string().nullable().optional(),
  targetMetric: targetMetricSchema.nullable().optional(),
  actualValue: z.number().nullable().optional(),
  status: z.nativeEnum(AchievementStatus),
});

export const achievementUpdateSchema = achievementCreateSchema.partial();
