import { cn } from "@/lib/cn";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  success: "bg-success/15 text-success dark:bg-success/20",
  warning: "bg-warning/15 text-warning dark:bg-warning/20",
  danger:  "bg-destructive/15 text-destructive dark:bg-destructive/20",
  info:    "bg-info/15 text-info dark:bg-info/20",
};

const dotStyles: Record<Tone, string> = {
  neutral: "bg-muted-foreground",
  success: "bg-success",
  warning: "bg-warning",
  danger:  "bg-destructive",
  info:    "bg-info",
};

export function StatusBadge({
  value,
  tone,
}: {
  value: string;
  tone?: Tone;
}) {
  const t = tone ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneStyles[t]
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", dotStyles[t])} aria-hidden />
      {value}
    </span>
  );
}
