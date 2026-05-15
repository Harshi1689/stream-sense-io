import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Droplets, Waves } from "lucide-react";
import { LevelBar } from "@/components/water/LevelBar";
import { StatusBadge } from "@/components/water/StatusBadge";
import { RESERVOIRS, GROUNDWATER, WARDS, CONSUMPTION_TREND } from "@/data/mock";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/water-status")({ component: WaterStatus });

function WaterStatus() {
  return (
    <div className="space-y-8" id="water-status-page">
      <header>
        <h1 className="text-3xl font-bold">Water status</h1>
        <p className="mt-1 text-muted-foreground">Reservoirs, groundwater and ward-by-ward supply availability.</p>
      </header>

      {/* Reservoirs */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Reservoir levels</h3>
            <Waves className="h-4 w-4 text-cyan" />
          </div>
          <div className="space-y-4">
            {RESERVOIRS.map((r) => (
              <div key={r.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-muted-foreground">{r.capacity} {r.unit}</span>
                </div>
                <LevelBar value={r.level} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
          <h3 className="mb-4 font-semibold">Weekly demand (kL)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CONSUMPTION_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Bar dataKey="liters" fill="var(--color-cyan)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Groundwater */}
      <section className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Groundwater conditions</h3>
          <Droplets className="h-4 w-4 text-cyan" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GROUNDWATER.map((g) => (
            <motion.div key={g.zone} whileHover={{ y: -2 }} className="rounded-xl bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{g.zone}</p>
                <StatusBadge status={g.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Avg borewell depth: {g.depth} ft</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Ward heatmap */}
      <section className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft" id="ward-heatmap">
        <h3 className="mb-4 font-semibold">Ward-wise availability</h3>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-9">
          {WARDS.map((w) => (
            <motion.div
              key={w.id}
              whileHover={{ scale: 1.05 }}
              className={cn(
                "aspect-square rounded-xl p-2 text-[11px] font-semibold flex flex-col justify-between text-white shadow-soft",
                w.status === "safe" && "bg-success",
                w.status === "medium" && "bg-warning text-foreground",
                w.status === "critical" && "bg-danger",
              )}
              title={`${w.name} · ${w.supply}`}
            >
              <span>{w.id}</span>
              <span className="line-clamp-1">{w.name}</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-success" /> Safe (24x7)</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-warning" /> Medium (alt days)</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-danger" /> Critical (tanker only)</span>
        </div>
      </section>
    </div>
  );
}
