import { prisma } from "@/lib/prisma";

export async function getPermissions() {
  return prisma.permission.findMany({
    orderBy: { code: "asc" },
    include: {
      roles: { include: { role: true } },
    },
  });
}