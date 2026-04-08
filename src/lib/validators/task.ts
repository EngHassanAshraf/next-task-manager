import { TaskStatus } from "@/generated/prisma/client";
import { z } from "zod";

export const taskCreateSchema = z.object({
  desc: z.string().min(1),
  siteId: z.string().min(1),
  assignmentToUserId: z.string().nullable().optional(),
  malfunctionId: z.string().nullable().optional(),
  status: z.nativeEnum(TaskStatus),
  statusDetails: z.string().nullable().optional(),
  startDatetime: z.coerce.date().nullable().optional(),
  endClosedDatetime: z.coerce.date().nullable().optional(),
});

export const taskStatusPatchSchema = z.object({
  status: z.nativeEnum(TaskStatus),
  statusDetails: z.string().nullable().optional(),
});
