import { cn } from "@/lib/utils";

type Status = "safe" | "medium" | "critical" | string;

const MAP: Record<string, { label: string; cls: string }> = {
  safe:     { label: "Safe",     cls: "bg-success/15 text-success" },
  medium:   { label: "Medium",   cls: "bg-warning/15 text-warning" },
  critical: { label: "Critical", cls: "bg-danger/15 text-danger" },
  pending:  { label: "Pending",  cls: "bg-warning/15 text-warning" },
  confirmed:{ label: "Confirmed",cls: "bg-cyan/15 text-cyan" },
  dispatched:{label: "Dispatched",cls: "bg-primary/15 text-primary" },
  delivered:{ label: "Delivered",cls: "bg-success/15 text-success" },
  cancelled:{ label: "Cancelled",cls: "bg-muted text-muted-foreground" },
  reported: { label: "Reported", cls: "bg-warning/15 text-warning" },
  resolved: { label: "Resolved", cls: "bg-success/15 text-success" },
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const m = MAP[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", m.cls, className)}>
      {m.label}
    </span>
  );
}
