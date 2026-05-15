import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Clock, Loader2, MapPin, Phone, Truck, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge } from "@/components/water/StatusBadge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tanker/$id")({ component: TrackTanker });

interface Booking {
  id: string;
  quantity_liters: number;
  location: string;
  landmark: string;
  delivery_date: string;
  delivery_time: string;
  status: string;
  driver_name: string;
  driver_phone: string;
  vehicle_number: string;
  eta_minutes: number;
  price: number;
  notes: string;
  created_at: string;
}

const TIMELINE = [
  { key: "confirmed",  label: "Booking confirmed",  desc: "We've received your request." },
  { key: "dispatched", label: "Tanker dispatched",  desc: "Driver is on the way to your location." },
  { key: "arriving",   label: "Arriving soon",      desc: "Driver is in your area." },
  { key: "delivered",  label: "Delivered",          desc: "Water delivered successfully." },
];

function TrackTanker() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("tanker_requests").select("*").eq("id", id).maybeSingle()
      .then(({ data }) => {
        setBooking(data as Booking | null);
        setLoading(false);
      });
  }, [id, user]);

  const cancel = async () => {
    if (!booking) return;
    const { error } = await supabase.from("tanker_requests").update({ status: "cancelled" }).eq("id", booking.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Booking cancelled");
    navigate({ to: "/history" });
  };

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!booking) return <div className="py-20 text-center text-muted-foreground">Booking not found.</div>;

  // Decide active timeline step from status
  const stepIdx = booking.status === "delivered" ? 3
    : booking.status === "cancelled" ? -1
    : booking.status === "dispatched" ? 1
    : booking.status === "confirmed" ? 0
    : 2;

  return (
    <div className="space-y-6" id="tanker-track-page">
      <Link to="/history" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to history
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tanker tracking</h1>
          <p className="mt-1 text-muted-foreground">Order #{booking.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <StatusBadge status={booking.status} className="text-sm" />
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Map placeholder */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-border bg-gradient-water shadow-soft">
          <div className="relative grid h-80 place-items-center bg-[radial-gradient(circle_at_30%_60%,rgba(56,189,248,0.25),transparent_50%)] lg:h-[420px]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <motion.div animate={{ x: [0, 60, 0], y: [0, -30, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-hero shadow-glow">
                <Truck className="h-7 w-7 text-primary-foreground" />
              </div>
            </motion.div>
            <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-card/90 p-3 backdrop-blur shadow-soft">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center gap-1"><Clock className="h-4 w-4 text-primary" /> ETA: ~{booking.eta_minutes} min</p>
                <span className="text-xs text-muted-foreground">Live · simulated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Driver */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft" id="driver-card">
            <h3 className="mb-4 font-semibold">Driver</h3>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-hero text-primary-foreground">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{booking.driver_name}</p>
                <p className="text-xs text-muted-foreground">Vehicle: {booking.vehicle_number}</p>
              </div>
              <a href={`tel:${booking.driver_phone}`} className="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success hover:bg-success/25">
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
            <h3 className="mb-3 font-semibold">Booking details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Quantity</dt><dd className="font-medium">{booking.quantity_liters}L</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Date</dt><dd className="font-medium">{booking.delivery_date}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Slot</dt><dd className="font-medium">{booking.delivery_time}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Total</dt><dd className="font-bold">₹{booking.price}</dd></div>
              <div className="flex items-start justify-between gap-2"><dt className="text-muted-foreground">Address</dt><dd className="text-right text-xs"><MapPin className="inline h-3 w-3 mr-0.5" />{booking.location}</dd></div>
            </dl>
          </div>

          {booking.status !== "delivered" && booking.status !== "cancelled" && (
            <Button id="cancel-booking-btn" variant="outline" onClick={cancel} className="w-full text-destructive border-destructive/30 hover:bg-destructive/5">
              Cancel booking
            </Button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft" id="delivery-timeline">
        <h3 className="mb-5 font-semibold">Delivery timeline</h3>
        <ol className="space-y-5">
          {TIMELINE.map((s, i) => {
            const done = i <= stepIdx;
            return (
              <li key={s.key} className="relative flex gap-4">
                {i < TIMELINE.length - 1 && <span className={cn("absolute left-4 top-8 h-full w-px", done ? "bg-primary" : "bg-border")} />}
                <div className={cn("z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2", done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground")}>
                  {done ? <Check className="h-4 w-4" /> : <span className="text-xs">{i + 1}</span>}
                </div>
                <div>
                  <p className={cn("font-medium", done ? "text-foreground" : "text-muted-foreground")}>{s.label}</p>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
