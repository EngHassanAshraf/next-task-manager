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
  // ── Roles ──────────────────────────────────────────────────────────────────
  const [superAdminRole, depAdminRole, siteManagerRole, siteAdminRole] = await Promise.all([
    prisma.role.upsert({
      where: { name: "SUPER_ADMIN" },
      update: { description: "Full system override — one per system" },
      create: { name: "SUPER_ADMIN", description: "Full system override — one per system" },
    }),
    prisma.role.upsert({
      where: { name: "DEP_ADMIN" },
      update: { description: "Department admin: full access, peer-admin ownership isolation" },
      create: { name: "DEP_ADMIN", description: "Department admin: full access, peer-admin ownership isolation" },
    }),
    prisma.role.upsert({
      where: { name: "SITE_MANAGER" },
      update: { description: "Site manager: own/assigned scope + delete" },
      create: { name: "SITE_MANAGER", description: "Site manager: own/assigned scope + delete" },
    }),
    prisma.role.upsert({
      where: { name: "SITE_ADMIN" },
      update: { description: "Site admin: own/assigned scope, no delete, no reports/admin" },
      create: { name: "SITE_ADMIN", description: "Site admin: own/assigned scope, no delete, no reports/admin" },
    }),
  ]);

  // ── Permissions ────────────────────────────────────────────────────────────
  const perms = [
    { code: "admin.users.manage",       description: "Manage users" },
    { code: "admin.roles.manage",       description: "Manage roles" },
    { code: "admin.permissions.manage", description: "Manage permissions" },
    { code: "admin.sites.manage",       description: "Manage sites" },
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

  // SUPER_ADMIN and DEP_ADMIN get all permissions
  for (const role of [superAdminRole, depAdminRole]) {
    await Promise.all(
      createdPerms.map((p) =>
        prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
          update: {},
          create: { roleId: role.id, permissionId: p.id },
        })
      )
    );
  }

  // ── Sites ──────────────────────────────────────────────────────────────────
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

  // ── Users ──────────────────────────────────────────────────────────────────
  const mkUser = async (
    id: string,
    email: string,
    name: string,
    roleId: string,
    password: string
  ) => {
    const passwordHash = await bcrypt.hash(password, 12);
    return prisma.user.upsert({
      where: { email },
      update: { name, roleId, passwordHash },
      create: { id, email, name, roleId, passwordHash },
    });
  };

  const superAdmin = await mkUser(
    "seed-user-super",
    "super@example.com",
    "Super Admin",
    superAdminRole.id,
    "super123"
  );

  const depAdmin = await mkUser(
    "seed-user-dep-admin",
    "depadmin@example.com",
    "Dep Admin",
    depAdminRole.id,
    "depadmin123"
  );

  const siteManager = await mkUser(
    "seed-user-site-manager",
    "sitemanager@example.com",
    "Site Manager",
    siteManagerRole.id,
    "sitemanager123"
  );

  const siteAdmin = await mkUser(
    "seed-user-site-admin",
    "siteadmin@example.com",
    "Site Admin",
    siteAdminRole.id,
    "siteadmin123"
  );

  // ── Sample data ────────────────────────────────────────────────────────────
  await prisma.task.upsert({
    where: { id: "seed-task-1" },
    update: {},
    create: {
      id: "seed-task-1",
      desc: "Sample task — inspect compound wiring",
      siteId: sites[0].id,
      assignmentToUserId: siteAdmin.id,
      status: "IN_PROGRESS",
      statusDetails: "Awaiting site access",
      createdByUserId: siteManager.id,
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
      reporterUserId: siteAdmin.id,
      status: "OPENED_ON_TASK",
      createdByUserId: siteAdmin.id,
    },
  });

  await prisma.achievement.upsert({
    where: { id: "seed-ach-computed" },
    update: {},
    create: {
      id: "seed-ach-computed",
      type: "COMPUTED",
      title: "Tasks closed this month",
      siteId: null,
      ownerUserId: depAdmin.id,
      targetMetric: { metric: "TASKS_CLOSED", window: "MONTH" },
      status: "IN_PROGRESS",
    },
  });

  console.log("Seed complete:", {
    roles: ["SUPER_ADMIN", "DEP_ADMIN", "SITE_MANAGER", "SITE_ADMIN"],
    users: [superAdmin.email, depAdmin.email, siteManager.email, siteAdmin.email],
  });
}

main()
  .then(async () => { await prisma.$disconnect(); await pool.end(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); await pool.end(); process.exit(1); });
