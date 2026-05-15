import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Loader2, MessageSquareWarning } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/water/StatusBadge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/leak")({ component: ReportLeak });

const SEVERITIES = [
  { key: "low",      label: "Low",      desc: "Slow drip / minor seepage" },
  { key: "medium",   label: "Medium",   desc: "Steady leak, not flooding" },
  { key: "critical", label: "Critical", desc: "Burst pipe, major loss" },
] as const;

const schema = z.object({
  location: z.string().trim().min(3, "Location required").max(200),
  severity: z.enum(["low", "medium", "critical"]),
  description: z.string().trim().min(10, "At least 10 chars").max(500),
});

interface Report {
  id: string; location: string; severity: string; description: string; status: string; created_at: string;
}

function ReportLeak() {
  const { user } = useAuth();
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "critical">("medium");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);

  const load = () => {
    if (!user) return;
    supabase.from("leakage_reports").select("id,location,severity,description,status,created_at").order("created_at", { ascending: false })
      .then(({ data }) => setReports((data ?? []) as Report[]));
  };
  useEffect(load, [user]); // eslint-disable-line

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({ location, severity, description: desc });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSubmitting(true);
    const { error } = await supabase.from("leakage_reports").insert({ ...parsed.data, user_id: user.id });
    if (!error) {
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Leak reported",
        message: `Thanks! We've forwarded your ${severity} leak report at ${location} to the water board.`,
        type: "leak",
      });
    }
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Leak report submitted");
    setLocation(""); setDesc(""); setSeverity("medium");
    load();
  };

  return (
    <div className="space-y-8" id="leak-report-page">
      <header>
        <h1 className="text-3xl font-bold">Report a leak</h1>
        <p className="mt-1 text-muted-foreground">Help save water for your community — every report counts.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <form id="leak-report-form" onSubmit={onSubmit} className="space-y-5 lg:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="space-y-2">
            <Label htmlFor="leak-location">Leak location</Label>
            <Input id="leak-location" name="location" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Street, landmark, ward..." />
          </div>

          <div className="space-y-2">
            <Label>Severity</Label>
            <div className="grid grid-cols-3 gap-2" id="leak-severity-selector">
              {SEVERITIES.map((s) => (
                <button
                  key={s.key} type="button" onClick={() => setSeverity(s.key)}
                  className={cn(
                    "rounded-xl border-2 p-3 text-left transition-all",
                    severity === s.key
                      ? s.key === "critical" ? "border-danger bg-danger/5" : s.key === "medium" ? "border-warning bg-warning/5" : "border-success bg-success/5"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <p className="font-semibold">{s.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leak-description">Describe the issue</Label>
            <Textarea id="leak-description" name="description" required rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="When did it start? How much water is being lost?" />
          </div>

          <div className="space-y-2">
            <Label>Photo (optional)</Label>
            <div className="grid h-32 place-items-center rounded-xl border-2 border-dashed border-border bg-muted/30 text-center text-muted-foreground" id="leak-photo-upload">
              <div>
                <Camera className="mx-auto h-7 w-7" />
                <p className="mt-2 text-xs">Photo upload coming soon</p>
              </div>
            </div>
          </div>

          <Button id="leak-submit-btn" type="submit" disabled={submitting} className="w-full bg-gradient-hero shadow-soft">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit report
          </Button>
        </form>

        <aside className="lg:col-span-2 space-y-3" id="leak-report-history">
          <h3 className="font-semibold">Your reports</h3>
          {reports.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              <MessageSquareWarning className="mx-auto h-8 w-8" />
              <p className="mt-2">No reports yet.</p>
            </div>
          )}
          {reports.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium line-clamp-1">{r.location}</p>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <StatusBadge status={r.severity} />
                <span className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </aside>
      </div>
    </div>
  );
}
