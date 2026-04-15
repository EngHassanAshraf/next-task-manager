"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageHeader({
  title,
  description,
  actions,
  rightSlot,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  rightSlot?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-border", className)}>
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {(actions || rightSlot) ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {rightSlot}
          {actions}
        </div>
      ) : null}
    </div>
  );
}
