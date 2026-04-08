import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { assertAdmin, badRequestIfUniqueViolation } from "@/lib/api-admin";
import { authOptions } from "@/lib/auth";
import { badRequest, serverError, tooManyRequests, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sortSitesByDisplayName } from "@/lib/site-name-sort";
import { siteCreateSchema } from "@/lib/validators/admin";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return unauthorized();
  }
  const sites = sortSitesByDisplayName(await prisma.site.findMany());
  return NextResponse.json(sites);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const denied = assertAdmin(session);
  if (denied) return denied;
  const rl = rateLimit({
    key: `api:sites:create:${session!.user.id}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(undefined, rl.retryAfterSeconds);
  const body = await request.json().catch(() => null);
  const parsed = siteCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }
  try {
    const site = await prisma.site.create({
      data: { name: parsed.data.name },
    });
    return NextResponse.json(site, { status: 201 });
  } catch (e) {
    const u = badRequestIfUniqueViolation(e);
    if (u) return u;
    console.error(e);
    return serverError("Could not create site");
  }
}
