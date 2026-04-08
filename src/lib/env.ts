function hasTemplate(value: string): boolean {
  return value.includes("${");
}

/** Resolves Postgres URL from DATABASE_URL or SUPABASE_* parts (dotenv does not expand ${} by default). */
export function getDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (raw && !hasTemplate(raw)) {
    return raw;
  }

  const user = process.env.SUPABASE_USER;
  const password = process.env.SUPABASE_PASSWORD;
  const host = process.env.SUPABASE_HOST;
  const port = process.env.SUPABASE_PORT ?? "5432";
  const database = process.env.SUPABASE_DATABASE;

  if (user && password && host && database) {
    const u = encodeURIComponent(user);
    const p = encodeURIComponent(password);
    return `postgresql://${u}:${p}@${host}:${port}/${database}`;
  }

  if (raw) {
    throw new Error(
      "DATABASE_URL contains unresolved ${...} placeholders. Set a full postgresql:// URL or define SUPABASE_USER, SUPABASE_PASSWORD, SUPABASE_HOST, SUPABASE_DATABASE."
    );
  }

  throw new Error(
    "Missing DATABASE_URL (or SUPABASE_* variables). Configure .env for PostgreSQL."
  );
}
