"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function DataTableShell({
  children,
  empty,
  className,
}: {
  children: ReactNode;
  empty?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className
      )}
    >
      <div className="overflow-x-auto">
        {children}
      </div>
      {empty ? (
        <div className="border-t border-border p-6">{empty}</div>
      ) : null}
    </div>
  );
}
