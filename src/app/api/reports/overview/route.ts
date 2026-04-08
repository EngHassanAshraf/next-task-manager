import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { unauthorized } from "@/lib/api-response";
import { getOverviewReportCached } from "@/lib/services/report-service";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return unauthorized();
  }
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId") ?? undefined;
  const report = await getOverviewReportCached(siteId ?? undefined);
  return NextResponse.json(report);
}
