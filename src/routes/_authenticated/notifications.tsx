import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, CheckCheck, Droplets, MessageSquareWarning, Truck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notifications")({ component: Notifications });

interface Notif {
  id: string; title: string; message: string; type: string; read: boolean; created_at: string;
}
const FILTERS = ["all", "unread", "alert", "tanker", "water", "leak"] as const;
type Filter = typeof FILTERS[number];

const ICONS: Record<string, typeof Bell> = {
  alert: BellOff, tanker: Truck, water: Droplets, leak: MessageSquareWarning, info: Bell,
};

function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  const load = () => {
    if (!user) return;
    supabase.from("notifications").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as Notif[]));
  };
  useEffect(load, [user]); // eslint-disable-line

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "unread") return items.filter((i) => !i.read);
    return items.filter((i) => i.type === filter);
  }, [items, filter]);

  const unread = items.filter((i) => !i.read).length;

  const markAll = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    toast.success("All marked as read");
    load();
  };

  const toggleRead = async (n: Notif) => {
    await supabase.from("notifications").update({ read: !n.read }).eq("id", n.id);
    load();
  };

  return (
    <div className="space-y-6" id="notifications-page">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="mt-1 text-muted-foreground">{unread} unread · stay on top of every alert.</p>
        </div>
        {unread > 0 && (
          <Button id="mark-all-read-btn" variant="outline" onClick={markAll}>
            <CheckCheck className="mr-1 h-4 w-4" /> Mark all read
          </Button>
        )}
      </header>

      <div className="flex flex-wrap gap-2" id="notification-filters">
        {FILTERS.map((f) => (
          <button
            key={f} onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-all",
              filter === f ? "bg-gradient-hero text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            {f}{f === "unread" && unread > 0 ? ` (${unread})` : ""}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <Bell className="mx-auto h-8 w-8" />
            <p className="mt-2">Nothing here.</p>
          </div>
        )}
        {filtered.map((n, i) => {
          const Icon = ICONS[n.type] ?? Bell;
          return (
            <motion.button
              key={n.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => toggleRead(n)}
              className={cn(
                "flex w-full items-start gap-4 rounded-2xl border p-5 text-left shadow-soft transition-all hover:-translate-y-0.5",
                n.read ? "border-border bg-card" : "border-primary/30 bg-primary/5"
              )}
            >
              <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", n.read ? "bg-muted text-muted-foreground" : "bg-gradient-hero text-primary-foreground shadow-soft")}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{n.title}</p>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-cyan" />}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
