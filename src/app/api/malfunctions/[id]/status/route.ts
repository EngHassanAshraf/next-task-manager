import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { badRequest, forbidden, unauthorized } from "@/lib/api-response";
import { canEditMalfunction } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { patchMalfunctionStatus } from "@/lib/services/malfunction-service";
import { malfunctionStatusPatchSchema } from "@/lib/validators/malfunction";

const include = {
  site: true,
  reporter: { select: { id: true, name: true, email: true } },
  task: { select: { id: true, desc: true, status: true } },
  createdBy: { select: { id: true, name: true, email: true } },
} as const;

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return unauthorized();
  }
  const { id } = await context.params;
  const existing = await prisma.malfunction.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!canEditMalfunction(session.user.roleName, session.user.id, existing)) {
    return forbidden();
  }
  const body = await request.json().catch(() => null);
  const parsed = malfunctionStatusPatchSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }
  await patchMalfunctionStatus(id, parsed.data.status, session.user.id);
  const row = await prisma.malfunction.findUniqueOrThrow({
    where: { id },
    include,
  });
  return NextResponse.json(row);
}
