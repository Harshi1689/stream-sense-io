import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Droplets, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WARD_OPTIONS } from "@/data/mock";

export const Route = createFileRoute("/signup")({ component: Signup });

const schema = z.object({
  full_name: z.string().trim().min(2, "Name too short").max(100),
  phone: z.string().trim().regex(/^[+\d\s-]{8,15}$/, "Invalid phone number"),
  email: z.string().trim().email("Invalid email").max(255),
  ward: z.string().min(1, "Select a ward"),
  password: z.string().min(6, "At least 6 characters").max(72),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

function Signup() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", ward: "", password: "", confirm: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/dashboard" });
  }, [authLoading, user, navigate]);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: parsed.data.full_name,
          phone: parsed.data.phone,
          ward: parsed.data.ward,
        },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-background">
      <div className="flex items-center justify-center p-6 sm:p-12 order-2 lg:order-1">
        <motion.form
          id="signup-form"
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-5"
        >
          <Link to="/" className="flex items-center gap-2 font-bold text-lg lg:hidden">
            <Droplets className="h-5 w-5 text-primary" /> JalaMitra
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Start managing your water supply smarter.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-name">Full name</Label>
            <Input id="signup-name" name="full_name" required value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Aisha Reddy" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="signup-phone">Phone</Label>
              <Input id="signup-phone" name="phone" required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98xxxxxxxx" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" name="email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-ward">Ward / Area</Label>
            <select
              id="signup-ward" name="ward" required value={form.ward} onChange={(e) => update("ward", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select your ward</option>
              {WARD_OPTIONS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input id="signup-password" name="password" type="password" required value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-confirm">Confirm</Label>
              <Input id="signup-confirm" name="confirm" type="password" required value={form.confirm} onChange={(e) => update("confirm", e.target.value)} placeholder="••••••••" />
            </div>
          </div>
          <Button type="submit" id="signup-submit-btn" disabled={submitting} className="w-full bg-gradient-hero shadow-soft">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create account
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </motion.form>
      </div>

      <div className="relative hidden overflow-hidden lg:block bg-gradient-hero order-1 lg:order-2">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.25),transparent_50%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl self-end">
            <Droplets className="h-6 w-6" /> JalaMitra
          </Link>
          <div>
            <h2 className="text-4xl font-bold leading-tight">Join 10,000+<br/>households.</h2>
            <p className="mt-3 max-w-sm text-primary-foreground/80">
              Track reservoir levels, get smart shortage forecasts and never run out of water.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
