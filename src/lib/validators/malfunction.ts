import { MalfunctionStatus } from "@/generated/prisma/client";
import { z } from "zod";

export const malfunctionCreateSchema = z.object({
  title: z.string().min(1),
  desc: z.string().min(1),
  siteId: z.string().min(1),
  reporterUserId: z.string().min(1),
  taskId: z.string().nullable().optional(),
  status: z.nativeEnum(MalfunctionStatus),
  endClosedDatetime: z.coerce.date().nullable().optional(),
});

export const malfunctionUpdateSchema = malfunctionCreateSchema
  .partial()
  .required({ title: true, desc: true, siteId: true, reporterUserId: true });

export const malfunctionStatusPatchSchema = z.object({
  status: z.nativeEnum(MalfunctionStatus),
});
