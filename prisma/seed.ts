import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

import { getDatabaseUrl } from "../src/lib/env";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: getDatabaseUrl() });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const [adminRole, managerRole, staffRole, siteAdminRole] = await Promise.all([
    prisma.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN", description: "Full access" },
    }),
    prisma.role.upsert({
      where: { name: "MANAGER" },
      update: {},
      create: { name: "MANAGER", description: "Manage all operational records" },
    }),
    prisma.role.upsert({
      where: { name: "STAFF" },
      update: {},
      create: { name: "STAFF", description: "Create and update own work" },
    }),
    prisma.role.upsert({
      where: { name: "SITE_ADMIN" },
      update: {},
      create: {
        name: "SITE_ADMIN",
        description: "Manage user accounts (no roles, sites, or permissions)",
      },
    }),
  ]);

  const perms = [
    { code: "admin.users.manage", description: "Manage users" },
    { code: "admin.roles.manage", description: "Manage roles" },
    { code: "admin.permissions.manage", description: "Manage permissions" },
    { code: "admin.sites.manage", description: "Manage sites" },
    { code: "site.users.manage", description: "Site admin: manage user accounts" },
  ];

  const createdPerms = await Promise.all(
    perms.map((p) =>
      prisma.permission.upsert({
        where: { code: p.code },
        update: { description: p.description },
        create: p,
      })
    )
  );

  await Promise.all(
    createdPerms.map((p) =>
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: adminRole.id, permissionId: p.id },
      })
    )
  );

  const siteUsersPerm = createdPerms.find((p) => p.code === "site.users.manage");
  if (siteUsersPerm) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: siteAdminRole.id, permissionId: siteUsersPerm.id },
      },
      update: {},
      create: { roleId: siteAdminRole.id, permissionId: siteUsersPerm.id },
    });
  }

  const sites = await Promise.all([
    prisma.site.upsert({
      where: { id: "seed-site-a" },
      update: {},
      create: { id: "seed-site-a", name: "Site A" },
    }),

    prisma.site.upsert({
      where: { id: "seed-site-b" },
      update: {},
      create: { id: "seed-site-b", name: "Site B" },
    }),
  ]);

  const mkUser = async (
    id: string,
    email: string,
    name: string,
    roleId: string,
    password: string
  ) => {
    const passwordHash = await bcrypt.hash(password, 10);
    return prisma.user.upsert({
      where: { email },
      update: { name, roleId, passwordHash },
      create: { id, email, name, roleId, passwordHash },
    });
  };

  const admin = await mkUser(
    "seed-user-admin",
    "admin@example.com",
    "Admin User",
    adminRole.id,
    "admin123"
  );

  const manager = await mkUser(
    "seed-user-manager",
    "manager@example.com",
    "Manager User",
    managerRole.id,
    "manager123"
  );

  const staff = await mkUser(
    "seed-user-staff",
    "staff@example.com",
    "Staff User",
    staffRole.id,
    "staff123"
  );
  await mkUser(
    "seed-user-site-admin",
    "siteadmin@example.com",
    "Site Admin",
    siteAdminRole.id,
    "siteadmin123"
  );

  await prisma.task.upsert({
    where: { id: "seed-task-1" },
    update: {},
    create: {
      id: "seed-task-1",
      desc: "Sample task — inspect compound wiring",
      siteId: sites[0].id,
      assignmentToUserId: staff.id,
      malfunctionId: null,
      status: "IN_PROGRESS",
      statusDetails: "Awaiting site access",
      createdByUserId: manager.id,
    },
  });

  await prisma.malfunction.upsert({
    where: { id: "seed-mal-1" },
    update: {},
    create: {
      id: "seed-mal-1",
      title: "Pump vibration",
      desc: "Unusual noise reported near pump room",
      siteId: sites[1].id,
      reporterUserId: staff.id,
      taskId: null,
      status: "OPENED_ON_TASK",
      createdByUserId: staff.id,
    },
  });

  await prisma.achievement.upsert({
    where: { id: "seed-ach-computed" },
    update: {},
    create: {
      id: "seed-ach-computed",
      type: "COMPUTED",
      title: "Tasks closed this month",
      desc: "System-tracked from task closures",
      siteId: null,
      ownerUserId: admin.id,
      targetMetric: {
        metric: "TASKS_CLOSED",
        window: "MONTH",
      },
      status: "IN_PROGRESS",
    },
  });

  await prisma.achievement.upsert({
    where: { id: "seed-ach-custom" },
    update: {},
    create: {
      id: "seed-ach-custom",
      type: "CUSTOM",
      title: "Trained 20 people at Site A",
      desc: "Manual milestone",
      siteId: sites[0].id,
      ownerUserId: staff.id,
      actualValue: 20,
      status: "ACHIEVED",
      achievedDatetime: new Date(),
    },
  });

  console.log("Seed complete:", {
    sites: sites.map((s) => s.name),
    users: [admin.email, manager.email, staff.email, "siteadmin@example.com"],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
