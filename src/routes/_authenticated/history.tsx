import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, RefreshCw, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge } from "@/components/water/StatusBadge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/history")({ component: History });

interface Row {
  id: string; quantity_liters: number; location: string;
  delivery_date: string; delivery_time: string; status: string;
  price: number; created_at: string;
}

function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!user) return;
    setLoading(true);
    supabase.from("tanker_requests").select("id,quantity_liters,location,delivery_date,delivery_time,status,price,created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setRows((data ?? []) as Row[]); setLoading(false); });
  };
  useEffect(load, [user]); // eslint-disable-line

  const cancel = async (id: string) => {
    const { error } = await supabase.from("tanker_requests").update({ status: "cancelled" }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Booking cancelled");
    load();
  };

  const rebook = (r: Row) => {
    navigate({ to: "/tanker" });
  };

  return (
    <div className="space-y-6" id="history-page">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Booking history</h1>
          <p className="mt-1 text-muted-foreground">All your tanker requests, past and present.</p>
        </div>
        <Link to="/tanker"><Button id="new-booking-btn" className="bg-gradient-hero shadow-soft"><Plus className="mr-1 h-4 w-4" /> New booking</Button></Link>
      </header>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Truck className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">No bookings yet</p>
          <p className="text-sm text-muted-foreground">Book your first tanker to see it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft"
              id={`booking-row-${r.id}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{r.quantity_liters}L · ₹{r.price}</p>
                    <p className="text-xs text-muted-foreground">{r.delivery_date} · {r.delivery_time} · {r.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status} />
                  <Link to="/tanker/$id" params={{ id: r.id }}>
                    <Button variant="outline" size="sm">Track</Button>
                  </Link>
                  {(r.status === "pending" || r.status === "confirmed") && (
                    <Button variant="outline" size="sm" className="text-destructive border-destructive/30" onClick={() => cancel(r.id)}>
                      Cancel
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => rebook(r)}><RefreshCw className="mr-1 h-3.5 w-3.5" /> Rebook</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
