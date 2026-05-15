import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, IndianRupee, Loader2, MapPin, Truck } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TANKER_PRICES } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tanker")({ component: BookTanker });

const QUANTITIES = [500, 1000, 2000, 5000];
const TIMES = ["08:00 - 10:00", "10:00 - 12:00", "12:00 - 14:00", "14:00 - 16:00", "16:00 - 18:00"];

const schema = z.object({
  quantity_liters: z.number().int().positive(),
  location: z.string().trim().min(3, "Location required").max(200),
  landmark: z.string().trim().max(200).optional().default(""),
  delivery_date: z.string().min(1, "Pick a date"),
  delivery_time: z.string().min(1, "Pick a time slot"),
  notes: z.string().trim().max(500).optional().default(""),
});

function BookTanker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileLocation, setProfileLocation] = useState("");
  const [quantity, setQuantity] = useState(1000);
  const [location, setLocation] = useState("");
  const [landmark, setLandmark] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState(TIMES[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("address, ward").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          const loc = data.address || data.ward || "";
          setProfileLocation(loc);
          if (!location) setLocation(loc);
        }
      });
  }, [user]); // eslint-disable-line

  const price = TANKER_PRICES[quantity] ?? 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({
      quantity_liters: quantity, location, landmark, delivery_date: date, delivery_time: time, notes,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.from("tanker_requests").insert({
      ...parsed.data,
      user_id: user.id,
      price,
      eta_minutes: 30 + Math.floor(Math.random() * 60),
      status: "confirmed",
    }).select("id").single();

    if (!error && data) {
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Tanker booked",
        message: `Your ${quantity}L tanker is confirmed for ${date} (${time}). Track it live now.`,
        type: "tanker",
      });
    }
    setSubmitting(false);

    if (error) { toast.error(error.message); return; }
    toast.success("Tanker booked successfully!");
    navigate({ to: "/tanker/$id", params: { id: data!.id } });
  };

  return (
    <div className="space-y-8" id="tanker-booking-page">
      <header>
        <h1 className="text-3xl font-bold">Book a tanker</h1>
        <p className="mt-1 text-muted-foreground">Fast, fair-priced water delivery — typically within 60 minutes.</p>
      </header>

      <form id="tanker-request-form" onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Quantity */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="mb-4 font-semibold">1. Choose quantity</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" id="quantity-selector">
              {QUANTITIES.map((q) => (
                <button
                  type="button" key={q} onClick={() => setQuantity(q)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all",
                    quantity === q ? "border-primary bg-primary/5 shadow-soft" : "border-border hover:border-primary/40"
                  )}
                >
                  <span className="text-xl font-bold">{q}L</span>
                  <span className="text-xs text-muted-foreground">₹{TANKER_PRICES[q]}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Address */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="mb-4 font-semibold">2. Delivery details</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tanker-location">Location / address</Label>
                <Input id="tanker-location" name="location" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="House #, street, area" />
                {profileLocation && location !== profileLocation && (
                  <button type="button" onClick={() => setLocation(profileLocation)} className="text-xs text-primary hover:underline">
                    Use my saved address
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanker-landmark">Landmark (optional)</Label>
                <Input id="tanker-landmark" name="landmark" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Near park, opposite school..." />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tanker-date"><Calendar className="mr-1 inline h-3.5 w-3.5" /> Delivery date</Label>
                  <Input id="tanker-date" name="delivery_date" type="date" required min={new Date().toISOString().split("T")[0]} value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanker-time"><Clock className="mr-1 inline h-3.5 w-3.5" /> Time slot</Label>
                  <select
                    id="tanker-time" name="delivery_time" value={time} onChange={(e) => setTime(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanker-notes">Notes (optional)</Label>
                <Textarea id="tanker-notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Gate code, special instructions..." />
              </div>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <motion.div
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-border bg-gradient-card p-6 shadow-glow"
            id="tanker-booking-summary"
          >
            <h3 className="font-semibold">Booking summary</h3>
            <div className="mt-4 grid h-24 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
              <Truck className="h-10 w-10" />
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Quantity</dt><dd className="font-semibold">{quantity}L</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Date</dt><dd className="font-semibold">{date || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Time slot</dt><dd className="font-semibold">{time}</dd></div>
              <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">Address</dt><dd className="font-medium text-right line-clamp-2">{location || "—"}</dd></div>
            </dl>
            <hr className="my-5 border-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estimated total</span>
              <span className="flex items-center text-2xl font-bold"><IndianRupee className="h-5 w-5" />{price}</span>
            </div>
            <Button id="tanker-submit-btn" type="submit" disabled={submitting} className="mt-5 w-full bg-gradient-hero shadow-soft">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm booking
            </Button>
            <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> Live tracking enabled after confirmation
            </p>
          </motion.div>
        </aside>
      </form>
    </div>
  );
}
