import type { Prisma } from "@/generated/prisma/client";

/** Users eligible for assignment on tasks/malfunctions (active, not soft-deleted). */
export const assignableUserWhere: Prisma.UserWhereInput = {
  active: true,
  deletedAt: null,
};
