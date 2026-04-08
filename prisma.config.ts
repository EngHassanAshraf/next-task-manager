import "dotenv/config";
import { defineConfig } from "prisma/config";

function resolveDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (raw && !raw.includes("${")) {
    return raw;
  }
  const user = process.env.SUPABASE_USER;
  const password = process.env.SUPABASE_PASSWORD;
  const host = process.env.SUPABASE_HOST;
  const port = process.env.SUPABASE_PORT ?? "5432";
  const database = process.env.SUPABASE_DATABASE;
  if (user && password && host && database) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  }
  return raw;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: resolveDatabaseUrl(),
  },
});
