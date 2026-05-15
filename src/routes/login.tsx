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

export const Route = createFileRoute("/login")({ component: Login });

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});

function Login() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/dashboard" });
  }, [authLoading, user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-background">
      <div className="relative hidden overflow-hidden lg:block bg-gradient-hero">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_50%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Droplets className="h-6 w-6" /> JalaMitra
          </Link>
          <div>
            <h2 className="text-4xl font-bold leading-tight">Stay ahead of every shortage.</h2>
            <p className="mt-3 max-w-sm text-primary-foreground/80">
              Real-time reservoir levels, smart tanker bookings, and instant alerts — all in one app.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.form
          id="login-form"
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-5"
        >
          <Link to="/" className="flex items-center gap-2 font-bold text-lg lg:hidden">
            <Droplets className="h-5 w-5 text-primary" /> JalaMitra
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your JalaMitra account.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input id="login-email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input id="login-password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" id="login-remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-border" />
              Remember me
            </label>
            <button type="button" className="text-primary hover:underline" onClick={() => toast.info("Password reset coming soon — contact support.")}>
              Forgot password?
            </button>
          </div>
          <Button type="submit" id="login-submit-btn" disabled={submitting} className="w-full bg-gradient-hero shadow-soft">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            New here? <Link to="/signup" className="font-medium text-primary hover:underline">Create an account</Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
