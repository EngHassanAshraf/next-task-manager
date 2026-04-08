import { Badge } from "@/components/ui/badge";

export function StatusBadge({
  value,
  tone,
}: {
  value: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const t = tone ?? "neutral";
  const variant =
    t === "success"
      ? "success"
      : t === "warning"
        ? "warning"
        : t === "danger"
          ? "destructive"
          : t === "info"
            ? "info"
            : "secondary";

  return <Badge variant={variant}>{value}</Badge>;
}

