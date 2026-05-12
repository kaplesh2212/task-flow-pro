import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Flame,
  Bell,
  LayoutDashboard,
  MoonStar,
  Smartphone,
  Sparkles,
  ArrowRight,
  Star,
  ChevronDown,
  Rocket,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: CheckSquare,
    title: "Smart To Do List App",
    desc: "Capture tasks in seconds. Set priorities, due dates, and let Infinitodo shape your day around what matters.",
    color: "from-teal-500 to-emerald-500",
  },
  {
    icon: Flame,
    title: "Habit Tracker with Streaks",
    desc: "Build the routines you want. Check off habits daily, grow your streak, and beat your personal best.",
    color: "from-orange-500 to-rose-500",
  },
  {
    icon: Bell,
    title: "Reminder App That Gets Through",
    desc: "Full-screen alerts with sound — never miss the meds, the meeting, or the call back again.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: LayoutDashboard,
    title: "Daily Planner Dashboard",
    desc: "Productivity score, today's tasks, habit progress, and streaks — your morning briefing in one place.",
    color: "from-sky-500 to-indigo-500",
  },
  {
    icon: MoonStar,
    title: "Light & Dark Mode",
    desc: "Beautiful in both themes. Follow your system or switch instantly. Easy on the eyes, all day long.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Smartphone,
    title: "Works Everywhere",
    desc: "Mobile, tablet, desktop — same data, same delight. Bottom nav on the go, full sidebar at your desk.",
    color: "from-pink-500 to-rose-500",
  },
];

const benefits = [
  { title: "Less mental load", body: "Stop juggling notes, sticky pads, and scattered apps. One home for your day." },
  { title: "Real consistency", body: "The habit tracker rewards showing up, not perfection — streaks make it stick." },
  { title: "Reminders that work", body: "A full-screen alert beats a buried notification every single time." },
  { title: "A clearer day", body: "The dashboard shows what matters now, not the entire universe of your tasks." },
  { title: "Faster than a spreadsheet", body: "Add a task or habit in two clicks. No menus, no friction." },
  { title: "It feels good", body: "Smooth animations, satisfying sounds, and confetti when you finish — productivity with joy." },
];

const faqs = [
  {
    q: "Is Infinitodo really free?",
    a: "Yes. The core to do list app, habit tracker, and reminder app features are completely free to use — no trial timer, no surprise paywall on the basics.",
  },
  {
    q: "Can I use Infinitodo on mobile?",
    a: "Absolutely. Infinitodo is fully responsive — bottom navigation on phones, a sidebar on desktop, and the same data on every device.",
  },
  {
    q: "How does the habit tracker work?",
    a: "Add the habits you want to build, check them off each day, and Infinitodo automatically calculates your current streak, your personal best, and how close you are to beating it.",
  },
  {
    q: "Will I actually get notified about my reminders?",
    a: "Yes. The reminder app shows a full-screen alert with sound when a reminder fires, so a quiet notification never costs you the meeting again.",
  },
  {
    q: "Does this work as a daily planner?",
    a: "That is exactly what it is built for. The dashboard combines today's tasks, habit check-ins, reminders, and a productivity score — your full day on one screen.",
  },
  {
    q: "Is my data safe?",
    a: "Your data is stored securely and only you can see it. Infinitodo never sells data and only uses it to power your productivity tool experience.",
  },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Infinitodo — Free To Do List App, Habit Tracker & Reminder App";
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-8" data-testid="page-landing">
      {/* HERO */}
      <section className="relative overflow-hidden -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 pt-6 pb-12 sm:pb-16">
        {/* Ambient glow */}
        <motion.div
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -top-10 right-0 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl pointer-events-none"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs sm:text-sm font-semibold mb-5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            All-in-one productivity tool · Free to use
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05]"
          >
            Your{" "}
            <span className="bg-gradient-to-br from-teal-500 to-emerald-500 bg-clip-text text-transparent">
              to do list app
            </span>
            ,{" "}
            <span className="bg-gradient-to-br from-orange-500 to-rose-500 bg-clip-text text-transparent">
              habit tracker
            </span>{" "}
            &amp;{" "}
            <span className="bg-gradient-to-br from-amber-500 to-orange-500 bg-clip-text text-transparent">
              reminder app
            </span>
            {" "}— all in one.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Infinitodo is the productivity tool that finally fits your day. Plan tasks, build streaks, and get smart reminders so nothing important slips. A daily planner that actually feels good to open every morning.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <Button
              onClick={() => setLocation("/")}
              size="lg"
              className="w-full sm:w-auto h-12 px-7 text-base font-semibold bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-lg shadow-teal-500/30"
              data-testid="button-start-app-hero"
            >
              Start Using App
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <a href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-7 text-base font-semibold">
                See features
              </Button>
            </a>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1 font-semibold text-foreground">4.9/5</span>
              <span>· 1,280+ users</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Privacy first
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Lightning fast
            </span>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-20">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Everything you need, nothing you don't
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            A clean, fast productivity tool built around the three things that actually move the needle: tasks, habits, and reminders.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full border hover:border-primary/40 hover:shadow-lg transition-all">
                <CardContent className="p-5 sm:p-6">
                  <div
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-md mb-4`}
                  >
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg mb-1.5">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="relative">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Benefits you'll feel by week one
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            A productivity tool only matters if it changes your day. Here's what users tell us.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-3 p-4 sm:p-5 rounded-xl border bg-card hover:border-primary/30 transition-colors"
            >
              <div className="shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow">
                ✓
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm sm:text-base">{b.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{b.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section>
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Why choose Infinitodo
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Most productivity apps either do too little or drown you in features. Infinitodo hits the sweet spot.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4 text-sm sm:text-base text-foreground/80 leading-relaxed">
            <p>
              We built Infinitodo for the person who has tried five other apps and keeps falling back to a paper list. It is fast enough to capture a thought before it disappears, structured enough to actually plan a week, and warm enough to want to open every morning.
            </p>
            <p>
              No bloat. No paywalled basics. Just a daily planner that respects your time and an experience that quietly makes you better.
            </p>
            <p>
              Whether you need a <strong>to do list app</strong> for work, a <strong>habit tracker</strong> for your health goals, or a <strong>reminder app</strong> for your family routines — Infinitodo keeps it simple, keeps it together, and keeps you moving.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700 text-white p-6 shadow-xl"
          >
            <motion.div
              className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <Rocket className="h-7 w-7 mb-3 opacity-90" />
            <h3 className="text-lg font-bold">Built for real days</h3>
            <p className="text-sm opacity-90 mt-1">Designed mobile-first, polished for desktop, obsessive about the small details.</p>
            <div className="grid grid-cols-3 gap-2 mt-5">
              <div className="rounded-lg bg-white/10 p-3 text-center">
                <div className="text-xl font-extrabold">3-in-1</div>
                <div className="text-[10px] opacity-80 mt-0.5">tasks · habits · reminders</div>
              </div>
              <div className="rounded-lg bg-white/10 p-3 text-center">
                <div className="text-xl font-extrabold">$0</div>
                <div className="text-[10px] opacity-80 mt-0.5">free to use</div>
              </div>
              <div className="rounded-lg bg-white/10 p-3 text-center">
                <div className="text-xl font-extrabold">4.9★</div>
                <div className="text-[10px] opacity-80 mt-0.5">user rating</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section>
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Quick answers about Infinitodo — the to do list app, habit tracker, and reminder app in one.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-2.5">
          {faqs.map((f, i) => {
            const isOpen = openFaq === i;
            return (
              <Card key={f.q} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-accent/40 transition-colors"
                  aria-expanded={isOpen}
                  data-testid={`faq-toggle-${i}`}
                >
                  <span className="font-semibold text-sm sm:text-base">{f.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-primary shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </motion.div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* FINAL CTA */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 text-white p-8 sm:p-12 text-center shadow-2xl shadow-teal-500/30"
        >
          <motion.div
            className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-orange-300/20 blur-3xl pointer-events-none"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 tracking-tight">
              Ready to plan a better day?
            </h2>
            <p className="text-sm sm:text-base opacity-95 mb-6 max-w-xl mx-auto">
              Open Infinitodo and capture your first task in under 10 seconds. No signup pressure, no clutter.
            </p>
            <Button
              onClick={() => setLocation("/")}
              size="lg"
              className="h-12 px-8 text-base font-bold bg-white text-teal-700 hover:bg-white/95 shadow-lg"
              data-testid="button-start-app-cta"
            >
              Start Using App
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          To do list app · Habit tracker · Reminder app · Daily planner · Productivity tool
        </p>
      </section>
    </div>
  );
}
