import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function LevelBar({ value, label }: { value: number; label?: string }) {
  const tone = value >= 60 ? "bg-success" : value >= 35 ? "bg-warning" : "bg-danger";
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span className="font-semibold text-foreground">{value}%</span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className={cn("h-full rounded-full", tone)}
        />
      </div>
    </div>
  );
}
