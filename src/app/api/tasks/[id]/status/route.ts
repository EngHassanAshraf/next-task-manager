import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { badRequest, forbidden, unauthorized } from "@/lib/api-response";
import { canEditTask } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { patchTaskStatus } from "@/lib/services/task-service";
import { taskStatusPatchSchema } from "@/lib/validators/task";

const include = {
  site: true,
  assignmentTo: { select: { id: true, name: true, email: true } },
  malfunction: { select: { id: true, title: true } },
  createdBy: { select: { id: true, name: true, email: true } },
} as const;

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return unauthorized();
  }
  const { id } = await context.params;
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!canEditTask(session.user.roleName, session.user.id, existing)) {
    return forbidden();
  }
  const body = await request.json().catch(() => null);
  const parsed = taskStatusPatchSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.message);
  }
  const v = parsed.data;
  await patchTaskStatus(id, v.status, v.statusDetails, session.user.id);
  const task = await prisma.task.findUniqueOrThrow({
    where: { id },
    include,
  });
  return NextResponse.json(task);
}
