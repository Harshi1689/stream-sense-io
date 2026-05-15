import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, Shield, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WARD_OPTIONS } from "@/data/mock";

export const Route = createFileRoute("/_authenticated/profile")({ component: Profile });

const profileSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[+\d\s-]{8,15}$/, "Invalid phone"),
  ward: z.string().min(1, "Select a ward"),
  address: z.string().trim().max(300),
});

const passwordSchema = z.object({
  password: z.string().min(6, "At least 6 characters").max(72),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", ward: "", address: "", notifications_enabled: true });
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwd, setPwd] = useState({ password: "", confirm: "" });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setForm(data as typeof form); });
  }, [user]);

  const update = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      ...parsed.data, notifications_enabled: form.notifications_enabled,
    }).eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated");
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(pwd);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setPwdSaving(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setPwdSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    setPwd({ password: "", confirm: "" });
  };

  return (
    <div className="space-y-8" id="profile-page">
      <header>
        <h1 className="text-3xl font-bold">Profile & settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account, address and notification preferences.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Profile card */}
        <aside className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-hero text-primary-foreground shadow-glow">
              <UserIcon className="h-9 w-9" />
            </div>
            <p className="mt-4 font-semibold text-lg">{form.full_name || "—"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="mt-2 text-xs text-muted-foreground">{form.ward || "Ward not set"}</p>
          </div>
        </aside>

        {/* Edit form */}
        <form id="profile-form" onSubmit={saveProfile} className="lg:col-span-3 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-semibold">Account info</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full name</Label>
              <Input id="profile-name" name="full_name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input id="profile-phone" name="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-ward">Ward</Label>
            <select id="profile-ward" name="ward" value={form.ward} onChange={(e) => update("ward", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select ward</option>
              {WARD_OPTIONS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-address">Address</Label>
            <Textarea id="profile-address" name="address" rows={3} value={form.address} onChange={(e) => update("address", e.target.value)} />
          </div>
          <label className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Notifications</p>
              <p className="text-xs text-muted-foreground">Receive water alerts and tanker updates</p>
            </div>
            <input id="profile-notifications" type="checkbox" checked={form.notifications_enabled} onChange={(e) => update("notifications_enabled", e.target.checked)} className="h-5 w-9 rounded-full" />
          </label>
          <Button id="profile-save-btn" type="submit" disabled={saving} className="w-full bg-gradient-hero shadow-soft">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save changes
          </Button>
        </form>
      </div>

      {/* Password */}
      <form id="change-password-form" onSubmit={changePassword} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Change password</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input id="new-password" name="password" type="password" required value={pwd.password} onChange={(e) => setPwd({ ...pwd, password: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input id="confirm-password" name="confirm" type="password" required value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} />
          </div>
        </div>
        <Button id="change-password-btn" type="submit" disabled={pwdSaving} className="mt-5 bg-gradient-hero shadow-soft">
          {pwdSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update password
        </Button>
      </form>
    </div>
  );
}
