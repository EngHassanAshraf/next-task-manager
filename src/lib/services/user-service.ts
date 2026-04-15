import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export type UserUpdateData = {
  name?: string | null;
  email?: string;
  roleId?: string;
  active?: boolean;
};

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { email: "asc" },
    include: { role: true },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
}

export async function updateUser(id: string, data: UserUpdateData) {
  return prisma.user.update({
    where: { id },
    data,
    include: { role: true },
  });
}

export async function changeUserPassword(id: string, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 12);
  return prisma.user.update({
    where: { id },
    data: { passwordHash },
  });
}