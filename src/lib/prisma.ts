import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { getDatabaseUrl } from "@/lib/env";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrisma(): PrismaClient {
  const url = getDatabaseUrl();
  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString: url,
    });
  globalForPrisma.pool = pool;
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
