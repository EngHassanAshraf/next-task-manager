"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-primary text-primary-foreground",
        secondary:   "bg-secondary text-secondary-foreground",
        outline:     "border border-border text-foreground",
        success:     "bg-success/15 text-success dark:bg-success/20",
        warning:     "bg-warning/15 text-warning dark:bg-warning/20",
        destructive: "bg-destructive/15 text-destructive dark:bg-destructive/20",
        info:        "bg-info/15 text-info dark:bg-info/20",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
