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
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-48">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {rightSlot}
        {actions}
      </div>
    </div>
  );
}

