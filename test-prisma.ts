import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { getDatabaseUrl } from "./src/lib/env";
import { PrismaClient } from "./src/generated/prisma/client";

async function main() {
  const url = getDatabaseUrl();
  console.log("Database URL:", url.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@"));
  
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
      include: { role: true },
    });
    console.log("User found:", user ? {
      id: user.id,
      email: user.email,
      active: user.active,
      deletedAt: user.deletedAt,
      passwordHash: user.passwordHash ? "***" : null,
      roleId: user.roleId,
      role: user.role ? { name: user.role.name } : null,
    } : null);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();