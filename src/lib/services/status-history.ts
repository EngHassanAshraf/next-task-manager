import type { HistoryEntityType } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

export async function recordStatusHistory(
  entityType: HistoryEntityType,
  entityId: string,
  fromStatus: string | null,
  toStatus: string,
  changedByUserId: string,
  note?: string | null
): Promise<void> {
  await prisma.statusHistory.create({
    data: {
      entityType,
      entityId,
      fromStatus,
      toStatus,
      changedByUserId,
      note: note ?? null,
    },
  });
}
