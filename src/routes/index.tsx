import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { ArrowRight, Bell, Droplets, Gauge, MapPin, Truck, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "JalaMitra — Smart Water Distribution & Forecasting" },
      { name: "description", content: "Book tankers, track deliveries, monitor reservoirs and report leaks for Bengaluru's smart water grid." },
    ],
  }),
});

const FEATURES = [
  { icon: Truck,    title: "On-demand tankers",  desc: "Book 500–5000L tankers with live tracking and ETA." },
  { icon: Gauge,    title: "Live water status",  desc: "Reservoir & groundwater levels, ward-by-ward." },
  { icon: Waves,    title: "Leak reporting",     desc: "Report leaks in 30 seconds with photo & severity." },
  { icon: Bell,     title: "Smart alerts",       desc: "Shortage forecasts and municipal updates in real time." },
];

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero shadow-glow">
              <Droplets className="h-5 w-5 text-primary-foreground" />
            </div>
            JalaMitra
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" id="nav-login-btn">Sign in</Button></Link>
            <Link to="/signup"><Button id="nav-signup-btn" className="bg-gradient-hero shadow-soft">Get started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-water" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <MapPin className="h-3 w-3" /> Built for Bengaluru's water crisis
            </span>
            <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
              Smart water for<br />
              <span className="bg-gradient-hero bg-clip-text text-transparent">every household.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              JalaMitra connects citizens, tanker operators and municipal authorities through one
              AI-powered platform — so you never run dry.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup">
                <Button size="lg" id="hero-cta-signup" className="bg-gradient-hero shadow-glow">
                  Create free account <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" id="hero-cta-login">I already have an account</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-hero shadow-soft">
                <Icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} JalaMitra · A smarter way to manage water.
      </footer>
    </div>
  );
}
