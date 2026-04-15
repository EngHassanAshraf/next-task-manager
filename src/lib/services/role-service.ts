import { prisma } from "@/lib/prisma";

export type RoleUpdateData = {
  name?: string;
  description?: string | null;
  permissionIds?: string[];
};

export async function getRoles() {
  return prisma.role.findMany({
    orderBy: { name: "asc" },
    include: {
      permissions: { include: { permission: true } },
    },
  });
}

export async function getRoleById(id: string) {
  return prisma.role.findUnique({
    where: { id },
    include: {
      permissions: { include: { permission: true } },
    },
  });
}

export async function updateRole(id: string, data: RoleUpdateData) {
  const { permissionIds, ...roleData } = data;

  const role = await prisma.role.update({
    where: { id },
    data: roleData,
  });

  if (permissionIds !== undefined) {
    await prisma.rolePermission.deleteMany({ where: { roleId: id } });
    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map((pid) => ({ roleId: id, permissionId: pid })),
      });
    }
  }

  return getRoleById(id);
}