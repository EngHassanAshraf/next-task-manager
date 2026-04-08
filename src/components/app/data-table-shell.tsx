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
        "overflow-x-auto rounded-xl border border-border bg-card shadow-sm",
        className
      )}
    >
      {children}
      {empty ? <div className="border-t border-border p-4">{empty}</div> : null}
    </div>
  );
}

