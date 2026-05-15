import { ReactNode, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Droplets, Gauge, History, LogOut, Map, Menu, MessageSquareWarning, Truck, User as UserIcon, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/water-status", label: "Water Status", icon: Droplets },
  { to: "/tanker", label: "Book Tanker", icon: Truck },
  { to: "/history", label: "Booking History", icon: History },
  { to: "/leak", label: "Report Leak", icon: MessageSquareWarning },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: UserIcon },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background flex" id="app-shell">
      {/* Sidebar */}
      <aside
        id="app-sidebar"
        className={cn(
          "fixed lg:sticky top-0 z-40 h-screen w-72 shrink-0 border-r border-border bg-card/80 backdrop-blur-xl transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-5">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero shadow-glow">
              <Droplets className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="tracking-tight">JalaMitra</span>
          </Link>
          <button className="lg:hidden p-1" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = path === to || (to !== "/dashboard" && path.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                id={`nav-${to.replace("/", "")}`}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-gradient-hero text-primary-foreground shadow-soft"
                    : "text-foreground/70 hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "" : "text-primary")} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3">
          <button
            id="signout-btn"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header
          id="app-topbar"
          className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-8"
        >
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 hover:bg-accent lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-cyan/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
              </span>
              Live · Bengaluru water grid
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/notifications" className="relative rounded-lg p-2 hover:bg-accent" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Link>
            <Link to="/profile" className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:shadow-soft transition-shadow">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-hero text-primary-foreground text-xs font-bold">
                {(user?.email ?? "U").slice(0, 1).toUpperCase()}
              </div>
              <span className="hidden sm:inline max-w-[140px] truncate">{user?.email}</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
