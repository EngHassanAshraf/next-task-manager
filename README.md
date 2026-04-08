# Task Manager

A full-stack task and malfunction tracking application built with Next.js 16, Prisma, and PostgreSQL. Supports Arabic and English, dark/light mode, and role-based access control.

## Features

- **Tasks** — create, assign, track status (New → In Progress → Blocked → Done → Closed)
- **Malfunctions** — report and link malfunctions to tasks, track resolution
- **Achievements** — log computed or custom achievements per site/user
- **Reports** — overview charts for tasks and malfunctions
- **Admin panel** — manage users, roles, permissions, and sites
- **Account** — profile editing, password change, active session management
- **Auth** — credentials-based login with session tracking, IP logging, and audit events
- **i18n** — Arabic (RTL) and English support
- **RBAC** — role and permission system with per-route enforcement

## Tech Stack

- [Next.js 16](https://nextjs.org) — App Router, Server Components
- [Prisma 7](https://www.prisma.io) — ORM with `@prisma/adapter-pg` for connection pooling
- [PostgreSQL](https://www.postgresql.org) — via [Supabase](https://supabase.com)
- [NextAuth v4](https://next-auth.js.org) — credentials provider with JWT sessions
- [Tailwind CSS v4](https://tailwindcss.com) — utility-first styling
- [Radix UI](https://www.radix-ui.com) — accessible UI primitives
- [Recharts](https://recharts.org) — report charts
- [Zod](https://zod.dev) — schema validation
- [Vitest](https://vitest.dev) — unit tests

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (Supabase recommended)

### Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |

3. Run database migrations:

```bash
npm run db:migrate
```

4. Seed initial data (admin role + default user):

```bash
npm run db:seed
```

5. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client and build for production |
| `npm run start` | Start production server |
| `npm run db:migrate` | Run pending migrations (`prisma migrate deploy`) |
| `npm run db:seed` | Seed the database |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run typecheck` | TypeScript type check |
| `npm run lint` | ESLint |
| `npm run test:run` | Run unit tests once |
| `npm run check` | Typecheck + lint + tests |

## Deployment (Vercel)

1. Push the repo to GitHub and import it in [Vercel](https://vercel.com).
2. Set the following environment variables in the Vercel dashboard:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Use the **session-mode pooler** URL from Supabase (port `5432`) |
| `NEXTAUTH_SECRET` | Strong random string |
| `NEXTAUTH_URL` | Your Vercel deployment URL |

3. Vercel will automatically run `prisma generate && next build` on each deploy.

> Run `npm run db:migrate` once against your production database before the first deploy (or from a CI step).

## Project Structure

```
src/
  app/
    (main)/         # Authenticated app — tasks, malfunctions, achievements, reports, admin, account
    api/            # REST API route handlers
    login/          # Login page
  components/       # Shared UI components
  lib/
    auth.ts         # NextAuth config
    prisma.ts       # Prisma client singleton
    rbac.ts         # Role/permission helpers
    i18n/           # Translations (ar, en)
    services/       # Business logic (task, malfunction, report, achievement)
    validators/     # Zod schemas
prisma/
  schema.prisma     # Database schema
  migrations/       # SQL migrations
  seed.ts           # Seed script
```
