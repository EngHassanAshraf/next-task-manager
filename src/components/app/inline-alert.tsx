"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function InlineAlert({
  children,
  tone = "danger",
  className,
  role = "alert",
}: {
  children: ReactNode;
  tone?: "info" | "success" | "warning" | "danger";
  className?: string;
  role?: "alert" | "status";
}) {
  const toneClass =
    tone === "success"
      ? "border-success/30 bg-success/10 text-foreground"
      : tone === "warning"
        ? "border-warning/30 bg-warning/10 text-foreground"
        : tone === "info"
          ? "border-info/30 bg-info/10 text-foreground"
          : "border-destructive/30 bg-destructive/10 text-foreground";

  return (
    <div
      role={role}
      className={cn("rounded-lg border px-3 py-2 text-sm", toneClass, className)}
    >
      {children}
    </div>
  );
}

