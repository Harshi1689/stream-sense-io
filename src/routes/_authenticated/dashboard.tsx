import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Bell, Droplets, MessageSquareWarning, Truck, TrendingDown, TrendingUp, Waves, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { LevelBar } from "@/components/water/LevelBar";
import { StatusBadge } from "@/components/water/StatusBadge";
import { RESERVOIRS, GROUNDWATER, CONSUMPTION_TREND } from "@/data/mock";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

const QUICK = [
  { to: "/tanker", icon: Truck, label: "Request Tanker", id: "request-tanker-btn", grad: "from-primary to-cyan" },
  { to: "/leak", icon: MessageSquareWarning, label: "Report Leak", id: "report-leak-btn", grad: "from-rose-500 to-orange-400" },
  { to: "/water-status", icon: Droplets, label: "Water Status", id: "water-status-btn", grad: "from-cyan-500 to-teal-400" },
  { to: "/notifications", icon: Bell, label: "Notifications", id: "notifications-btn", grad: "from-violet-500 to-fuchsia-400" },
];

function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string; ward: string } | null>(null);
  const [recent, setRecent] = useState<Array<{ id: string; title: string; message: string; type: string; created_at: string }>>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, ward").eq("id", user.id).maybeSingle()
      .then(({ data }) => setProfile(data));
    supabase.from("notifications").select("id,title,message,type,created_at").order("created_at", { ascending: false }).limit(4)
      .then(({ data }) => setRecent(data ?? []));
  }, [user]);

  const firstName = (profile?.full_name || user?.email || "there").split(" ")[0];

  return (
    <div className="space-y-8" id="dashboard-page">
      {/* Welcome */}
      <motion.section
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 text-primary-foreground shadow-glow"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.25),transparent_50%)]" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium opacity-80">Welcome back</p>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl">Hi {firstName} 👋</h1>
            <p className="mt-2 max-w-md opacity-90">
              Your ward {profile?.ward ? `(${profile.ward})` : ""} is being monitored — here's today's water snapshot.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
            <Activity className="h-5 w-5" />
            <div>
              <p className="text-xs opacity-80">Grid status</p>
              <p className="font-semibold">All systems operational</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {QUICK.map(({ to, icon: Icon, label, id, grad }) => (
            <Link key={id} to={to} id={id}>
              <motion.div
                whileHover={{ y: -3 }}
                className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-glow"
              >
                <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${grad} shadow-soft`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold">{label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Reservoirs + Groundwater */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft" id="reservoirs-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Reservoir levels</h3>
            <Waves className="h-4 w-4 text-cyan" />
          </div>
          <div className="space-y-4">
            {RESERVOIRS.map((r) => (
              <div key={r.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">{r.name}</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    {r.trend === "up" ? <TrendingUp className="h-3.5 w-3.5 text-success" /> : <TrendingDown className="h-3.5 w-3.5 text-warning" />}
                    {r.capacity} {r.unit}
                  </span>
                </div>
                <LevelBar value={r.level} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft" id="groundwater-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Groundwater zones</h3>
            <Droplets className="h-4 w-4 text-cyan" />
          </div>
          <div className="space-y-3">
            {GROUNDWATER.map((g) => (
              <div key={g.zone} className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{g.zone}</p>
                  <p className="text-xs text-muted-foreground">Avg depth: {g.depth} ft</p>
                </div>
                <StatusBadge status={g.status} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consumption + recent alerts */}
      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft lg:col-span-2" id="consumption-card">
          <h3 className="mb-4 font-semibold">Your weekly consumption</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CONSUMPTION_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="liters" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--color-cyan)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft" id="recent-alerts-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Recent alerts</h3>
            <Link to="/notifications" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recent.length === 0 && <p className="text-sm text-muted-foreground">No notifications yet.</p>}
            {recent.map((n) => (
              <div key={n.id} className="rounded-xl border border-border bg-background/60 p-3">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
