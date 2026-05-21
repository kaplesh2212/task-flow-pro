import { motion } from "framer-motion";
import {
  Trophy,
  ListTodo,
  Activity,
  Zap,
  Flame,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  CircleDot,
  History,
  Bot,
  Brain,
  AlertCircle,
  Lightbulb,
  ShieldCheck,
  Star
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { AIAnalyser } from "./analytics";
import { useFirebaseData } from "@/hooks/useFirebase";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { PerspectiveCard } from "@/components/perspective-card";
import { sfx } from "@/lib/sfx";
import { useState, useEffect, useMemo } from "react";
import { subDays, format } from "date-fns";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Your discipline determines your destiny.", author: "Infinitodo" },
  { text: "Focus is a superpower in a world of noise.", author: "Cal Newport" },
  { text: "Success is the sum of small efforts, repeated day-in and day-out.", author: "Robert Collier" },
  { text: "Discipline is doing what needs to be done, even if you don't want to do it.", author: "Unknown" }
];

function CircularScore({ score }: { score: number }) {
  const scoreColor = score >= 70 ? "#00f2fe" : score >= 40 ? "#bc13fe" : "#ff0080";
  const glowColor = score >= 70 ? "rgba(0, 242, 254, 0.6)" : score >= 40 ? "rgba(188, 19, 254, 0.6)" : "rgba(255, 0, 128, 0.6)";

  return (
    <div className="relative flex h-48 w-48 sm:h-60 sm:w-60 items-center justify-center group/score cursor-pointer">
      {/* Plasma Pulse Aura */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 blur-[80px] rounded-full"
        style={{ backgroundColor: scoreColor }}
      />

      {/* Energy Rings Orbiting */}
      <div className="absolute inset-0 rounded-full border border-border/20 animate-[spin_20s_linear_infinity] opacity-20" />
      <div className="absolute inset-8 rounded-full border border-border/30 animate-[spin_15s_linear_infinity_reverse] opacity-20" />

      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="plasmaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bc13fe" />
            <stop offset="50%" stopColor={scoreColor} />
            <stop offset="100%" stopColor="#4facfe" />
          </linearGradient>
          <filter id="plasmaGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Reactor Track */}
        <circle className="text-muted/20" strokeWidth="4" stroke="currentColor" fill="transparent" r="46" cx="50" cy="50" />

        {/* Pulse Progress */}
        <motion.circle
          stroke="url(#plasmaGradient)"
          strokeWidth="12"
          strokeDasharray="289"
          initial={{ strokeDashoffset: 289 }}
          animate={{ strokeDashoffset: 289 - (289 * score) / 100 }}
          transition={{ duration: 3, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          fill="transparent"
          filter="url(#plasmaGlow)"
          r="46" cx="50" cy="50"
        />

        {/* Spark Indicators */}
        {score > 0 && (
          <motion.circle
            cx="50" cy="4" r="3" fill="white"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ transformOrigin: '50% 50%', transform: `rotate(${(score / 100) * 360}deg)` }}
          />
        )}
      </svg>

      <div className="absolute flex flex-col items-center z-10">
        <div className="relative">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl sm:text-8xl font-black tabular-nums tracking-tighter text-foreground drop-shadow-[0_0_20px_rgba(var(--primary),0.3)]"
          >
            {score}
          </motion.span>
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-4 -right-4"
          >
            <Zap className="w-8 h-8 text-yellow-500 fill-current blur-[1px]" />
          </motion.div>
        </div>
        <div className="h-1.5 w-20 bg-primary/10 rounded-full mt-2 overflow-hidden border border-primary/20">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="h-full w-1/2 bg-primary/60"
          />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground mt-2">Energy Level</span>
      </div>
    </div>
  );
}

function XPProgress({ currentXP }: { currentXP: number }) {
  const level = Math.floor(currentXP / 100) + 1;
  const xp = currentXP % 100;

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-end px-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.4)]">Prestige Level {level}</span>
            <div className="h-1 w-1 rounded-full bg-primary/40" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{currentXP} Total XP</span>
          </div>
          <span className="text-2xl font-black text-foreground italic tracking-tighter">Elite Operative</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Neural Sync</span>
          <span className="text-xl font-black tabular-nums text-primary">{xp}/100 XP</span>
        </div>
      </div>

      <div className="h-10 w-full bg-secondary/30 rounded-2xl overflow-hidden border border-border p-1.5 relative shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${xp}%` }}
          transition={{ duration: 2.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="h-full rounded-xl bg-gradient-to-r from-indigo-500 via-primary to-cyan-400 relative overflow-hidden shadow-[0_0_20px_rgba(var(--primary),0.4)]"
        >
          {/* Animated Energy Waves */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[45deg]"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]" />
        </motion.div>

        {/* HUD Scanner Line */}
        <motion.div
          animate={{ left: ["0%", "100%", "0%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_10px_#fff] z-20 opacity-50"
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [dailyQuote, setDailyQuote] = useState(QUOTES[0]);
  const [showAI, setShowAI] = useState(false);
  const [userName, setUserName] = useState(() => localStorage.getItem("Infinitodo_userName") || "Productive User");

  const { user } = useAuth();
  const { data: tasks, loading: loadingTasks } = useFirebaseData<any>("tasks");
  const { data: habits, loading: loadingHabits } = useFirebaseData<any>("habits");
  const { data: reminders, loading: loadingReminders } = useFirebaseData<any>("reminders");

  const summary = useMemo(() => {
    if (!tasks || !habits) return null;
    const today = new Date().toISOString().split('T')[0];
    const tasksToday = tasks.filter((t: any) => t.createdAt?.startsWith(today));
    const tasksCompletedToday = tasksToday.filter((t: any) => t.status === "completed");
    const habitsCompletedToday = habits.filter((h: any) => h.completedToday);
    
    const tasksWeight = (tasksCompletedToday.length / Math.max(tasksToday.length, 1)) * 50;
    const habitsWeight = (habitsCompletedToday.length / Math.max(habits.length, 1)) * 50;
    const productivityScore = Math.round(tasksWeight + habitsWeight);

    return {
      tasksTotal: tasksToday.length,
      tasksCompleted: tasksCompletedToday.length,
      habitsTotal: habits.length,
      habitsCompletedToday: habitsCompletedToday.length,
      dailyStreak: habits.reduce((max: number, h: any) => Math.max(max, h.streak || 0), 0),
      productivityScore
    };
  }, [tasks, habits]);

  const report = { days: [] }; // Simplified for now
  const activities = [];
  const loadingSummary = loadingTasks || loadingHabits || loadingReminders;
  const loadingReport = false;
  const loadingActivities = false;

  const score = summary?.productivityScore ?? 0;

  useEffect(() => {
    // Refresh name if it changes in settings (though unlikely without reload, but good practice)
    const storedName = localStorage.getItem("Infinitodo_userName");
    if (storedName && storedName !== userName) {
      setUserName(storedName);
    }
  }, []);

  useEffect(() => {
    const today = new Date().toDateString();
    const storedName = localStorage.getItem("Infinitodo_userName");
    if (storedName) setUserName(storedName);

    const stored = localStorage.getItem('Infinitodo_dailyQuote');
    if (stored) {
      try {
        const { date, quote } = JSON.parse(stored);
        if (date === today && quote) {
          setDailyQuote(quote);
          return;
        }
      } catch (e) { }
    }
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    localStorage.setItem('Infinitodo_dailyQuote', JSON.stringify({ date: today, quote: randomQuote }));
    setDailyQuote(randomQuote);
  }, []);

  useEffect(() => {
    if (score >= 90) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
      return () => clearInterval(interval);
    }
    return;
  }, [score]);

  const getScoreLabel = (s: number) => {
    if (s >= 90) return { label: "Elite Performance", color: "text-amber-500", icon: Trophy, level: "Master" };
    if (s >= 70) return { label: "High Momentum", color: "text-emerald-500", icon: Zap, level: "Expert" };
    if (s >= 50) return { label: "Solid Execution", color: "text-blue-500", icon: Activity, level: "Professional" };
    return { label: "Building Baseline", color: "text-slate-400", icon: CircleDot, level: "Apprentice" };
  };


  if (loadingSummary || loadingReport || loadingActivities) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-[200px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl lg:col-span-1" />
        </div>
      </div>
    );
  }

  const scoreInfo = getScoreLabel(score);
  const topStreaks = Array.isArray(habits) ? [...habits].sort((a, b) => b.streak - a.streak).slice(0, 4) : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      {/* 1. TOP BANNER: Daily Inspiration */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border bg-gradient-to-r from-primary/5 via-card to-primary/5 shadow-sm overflow-hidden group">
          <CardContent className="py-3 px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-6 flex-1 min-w-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="p-3 rounded-2xl bg-primary/20 text-primary flex shrink-0 shadow-[0_0_15px_rgba(var(--primary),0.2)] border border-primary/30"
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1">Deep Inspiration</span>
                <p className="text-lg font-black text-foreground tracking-tight italic leading-snug">
                  "{dailyQuote.text}" <span className="not-italic font-black text-primary/60 ml-4 border-l-2 border-primary/20 pl-4 uppercase tracking-[0.2em] text-xs">/ {dailyQuote.author}</span>
                </p>
              </div>
            </div>
            <div className="shrink-0 px-3 py-1 rounded-full bg-background/50 border border-border text-[9px] font-black uppercase tracking-widest text-primary/80">Inspiration</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 2. CORE HEADER: Welcome & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <PerspectiveCard className="lg:col-span-8 h-full">
          <Card className="h-full bg-card border-border shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
              <Trophy className="w-40 h-40 text-primary" />
            </div>
            <CardContent className="p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-8 h-full relative z-10">
              <div className="flex-1 text-center sm:text-left space-y-4">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Neural Sync Active</span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-foreground mb-4">Welcome, {userName.split(' ')[0]}</h1>

                  {/* Integrated XP Progress Bar */}
                  <div className="max-w-md">
                    <XPProgress currentXP={score} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <div className={cn("text-xs font-bold flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-xl border border-border/50", scoreInfo.color)}>
                    <scoreInfo.icon className="h-4 w-4" />
                    {scoreInfo.label}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                    <Star className="h-3 w-3 fill-current" />
                    Discipline {scoreInfo.level}
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <CircularScore score={score} />
              </div>
            </CardContent>
          </Card>
        </PerspectiveCard>

        <PerspectiveCard className={cn("h-full transition-all duration-700", showAI ? "lg:col-span-12" : "lg:col-span-4")}>
          <Card className="h-full border-border/50 bg-card/80 backdrop-blur-2xl shadow-2xl hover:shadow-primary/10 transition-all duration-500 group overflow-hidden relative rounded-[3rem]">
            {showAI ? (
              <div className="p-2 sm:p-6">
                <AIAnalyser onBack={() => setShowAI(false)} initialView="scanning" />
              </div>
            ) : (
              <>
                {/* Neural Atmosphere */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <CardHeader className="flex flex-row items-center justify-between p-8 pb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">AI Analyser</span>
                  </div>
                  <Sparkles className="w-5 h-5 text-foreground/20" />
                </CardHeader>

                <CardContent className="flex flex-col items-center justify-center p-8 pt-4 space-y-8 text-center relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative flex items-center justify-center"
                  >
                    {/* Pulsing Aura */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.1, 0.3],
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full"
                    />

                    <div className="relative z-10 w-32 h-32 rounded-[2.5rem] bg-card/40 backdrop-blur-xl border border-border/50 flex items-center justify-center shadow-2xl">
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#00FF9D] border-4 border-background flex items-center justify-center shadow-[0_0_10px_rgba(0,255,157,0.4)]">
                        <motion.div
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-1.5 h-1.5 rounded-full bg-white"
                        />
                      </div>
                      <Brain className="w-14 h-14 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.4)]" />

                      {/* Neural Scan Line */}
                      <motion.div
                        animate={{ top: ["10%", "90%", "10%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-x-2 h-0.5 bg-primary/30 blur-[1px]"
                      />
                    </div>
                  </motion.div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">Neural Sync <span className="text-primary">Analyser</span></h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-medium uppercase tracking-widest max-w-[260px] mx-auto opacity-70">
                      Analyze your productivity behavior and discover smarter focus patterns to optimize your day.
                    </p>
                  </div>

                  <div className="w-full pt-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (sfx.click) sfx.click();
                        setShowAI(true);
                      }}
                      className="w-full h-16 rounded-3xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all group"
                    >
                      Analyze Now
                      <TrendingUp className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </PerspectiveCard>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PerspectiveCard>
          <Card className="hover:shadow-md transition-all duration-300 cursor-pointer border-border hover:border-blue-500/30 group bg-card" onClick={() => setLocation("/tasks")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <ListTodo className="h-4 w-4" />
                </div>
                Tasks
              </CardTitle>
              <CardDescription>Daily priorities & deep work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black tabular-nums">{summary?.tasksCompleted ?? 0}/{summary?.tasksTotal ?? 0}</span>
                <div className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full uppercase">Today</div>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(summary?.tasksTotal || 0) > 0 ? (summary?.tasksCompleted || 0) / (summary?.tasksTotal || 1) * 100 : 0}%` }} className="h-full bg-blue-500" />
              </div>
            </CardContent>
          </Card>
        </PerspectiveCard>

        <PerspectiveCard>
          <Card className="hover:shadow-md transition-all duration-300 cursor-pointer border-border hover:border-emerald-500/30 group bg-card" onClick={() => setLocation("/habits")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Activity className="h-4 w-4" />
                </div>
                Habits
              </CardTitle>
              <CardDescription>Consistency & streaks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black tabular-nums">{summary?.habitsCompletedToday ?? 0}/{summary?.habitsTotal ?? 0}</span>
                <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase">Active</div>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(summary?.habitsTotal || 0) > 0 ? (summary?.habitsCompletedToday || 0) / (summary?.habitsTotal || 1) * 100 : 0}%` }} className="h-full bg-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </PerspectiveCard>

        <PerspectiveCard>
          <Card className="hover:shadow-md transition-all duration-300 cursor-pointer border-border hover:border-amber-500/30 group bg-card" onClick={() => setLocation("/habits")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Flame className="h-4 w-4" />
                </div>
                Momentum
              </CardTitle>
              <CardDescription>Daily focus streak</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black tabular-nums">{summary?.dailyStreak ?? 0} Days</span>
                <div className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full uppercase">On Fire</div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <div key={i} className={cn("h-1.5 flex-1 rounded-full", i <= (summary?.dailyStreak || 0) ? "bg-amber-500" : "bg-secondary")} />
                ))}
              </div>
            </CardContent>
          </Card>
        </PerspectiveCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2"><History className="h-5 w-5 text-primary" /> Productivity History</CardTitle>
                <CardDescription>Activity overview from the last 7 days</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={report?.days ?? []}>
                    <defs>
                      <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Area type="monotone" dataKey="tasksCompleted" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
                    <Area type="monotone" dataKey="habitsCompleted" stroke="#10b981" strokeWidth={2} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-card border border-border/50 shadow-2xl flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="p-4 rounded-3xl bg-primary/10 border border-primary/30">
                <Trophy className="w-12 h-12 text-primary animate-bounce" />
              </div>
              <h3 className="text-2xl font-black tracking-tighter uppercase italic text-center">Neural Champion</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Master of Focus</p>
            </div>
          </div>

          <Card className="border-border bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none">
              <Flame className="w-32 h-32 text-primary" />
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                High Momentum
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topStreaks.length > 0 ? topStreaks.map((h: any, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center justify-between p-4 rounded-[1.5rem] bg-gradient-to-br from-secondary/40 to-secondary/10 border border-white/5 hover:border-primary/30 transition-all group cursor-pointer shadow-lg shadow-black/5"
                  onClick={() => setLocation("/habits")}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/80 via-primary to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-[0_5px_15px_-5px_rgba(var(--primary),0.5)] group-hover:scale-110 transition-transform relative z-10 overflow-hidden">
                         {/* Sphere Highlight */}
                         <div className="absolute top-1 left-2 w-4 h-3 bg-white/30 rounded-full blur-[2px] -rotate-45" />
                         <span className="relative z-10 drop-shadow-md">{h.name[0]}</span>
                      </div>
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{h.name}</span>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 italic">Active Sync</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all">
                    <Flame className="w-4 h-4 fill-current animate-pulse" />
                    <span className="text-sm font-black tabular-nums">{h.streak}</span>
                  </div>
                </motion.div>
              )) : (
                <div className="py-10 text-center flex flex-col items-center gap-3">
                   <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center opacity-30">
                      <History className="w-5 h-5" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">No momentum detected</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
