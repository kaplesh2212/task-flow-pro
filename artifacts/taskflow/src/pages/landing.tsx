import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
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
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Brain,
  Timer,
  Terminal,
  Activity,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const features = [
  {
    icon: CheckSquare,
    title: "AI-Synced Task Matrix",
    desc: "Organize your workflow with priority queues, automatic categorizations, and neural scheduling tags designed to maximize execution.",
    color: "from-teal-500 via-emerald-400 to-green-500",
    shadow: "shadow-emerald-500/20",
  },
  {
    icon: Flame,
    title: "Atomic Habit Multipliers",
    desc: "Build unbreakable neuro-pathways. Check off daily habits, trigger streak rewards, and compete against your personal limits.",
    color: "from-orange-500 via-rose-500 to-red-500",
    shadow: "shadow-rose-500/20",
  },
  {
    icon: Bell,
    title: "High-Priority Interrupters",
    desc: "Cinematic full-screen alerts and rich audio feedback designed to pierce through focus lapses. Never miss a critical deliverable again.",
    color: "from-amber-400 via-orange-500 to-amber-600",
    shadow: "shadow-amber-500/20",
  },
  {
    icon: LayoutDashboard,
    title: "Neural Command Center",
    desc: "Your morning strategic briefing. A dynamic, HSL-themed dashboard unifying metrics, productivity multipliers, and daily focus tasks.",
    color: "from-sky-500 via-indigo-500 to-violet-600",
    shadow: "shadow-indigo-500/20",
  },
  {
    icon: Brain,
    title: "AI Cognitive Analysis",
    desc: "An intelligent productivity coach analyzing your work habits, peak performance windows, and streak consistency with live visual analytics.",
    color: "from-violet-500 via-fuchsia-500 to-purple-600",
    shadow: "shadow-fuchsia-500/20",
  },
  {
    icon: Timer,
    title: "Deep Work Audio Engines",
    desc: "A bespoke stopwatch timer coupled with crisp audio notifications designed to lock you into elite states of uninterrupted focus.",
    color: "from-pink-500 via-rose-500 to-indigo-600",
    shadow: "shadow-pink-500/20",
  },
];

const benefits = [
  {
    title: "Cognitive Load Reduction",
    body: "De-clutter your mind by offloading planning, task sequencing, and reminders onto an intelligent command interface.",
    tag: "Mental Balance",
  },
  {
    title: "Neurological Momentum Builders",
    body: "Harness gamified visual elements, confetti bursts, and streak multipliers to program consistent, daily execution.",
    tag: "High Streak",
  },
  {
    title: "Critical Priority Protection",
    body: "Screen-covering ambient alarms ensure high-priority habits and schedule timers take center stage when they matter.",
    tag: "Zero Miss",
  },
  {
    title: "Contextual Deep Work",
    body: "Eliminate distracting side panels with our dedicated focus environment, prioritizing singular flow and execution speed.",
    tag: "Pure Focus",
  },
];

const faqs = [
  {
    q: "Is Infinitodo truly free to use?",
    a: "Yes. All core features including the task matrix, habit streaks, full-screen reminders, and focus timer are completely free with unlimited usage. No hidden subscription paywalls on your productivity basics.",
  },
  {
    q: "Does my data sync securely across devices?",
    a: "Absolutely! When you sign in with Google, all your tasks, habits, and preferences sync in real-time to our cloud-native secure serverless Firestore database. If offline, the app safely persists everything to local storage.",
  },
  {
    q: "How does the AI Analyser provide feedback?",
    a: "The AI Analyser reads your historical completion logs, streak patterns, and time allocations to calculate an execution momentum score. It evaluates your peak focus windows, streak velocity, and generates tailored guidance.",
  },
  {
    q: "Can I use it on my mobile device?",
    a: "Yes. Infinitodo is built with standard-setting responsive mobile design. It adapts perfectly to dynamic screens, showing a premium bottom-nav layout on mobile and a spacious sidebar on desktop.",
  },
];

// Interactive Preview App Widget for the Landing Page
function InteractivePreviewWidget() {
  const [tasks, setTasks] = useState([
    { id: "1", title: "Complete deep work session 🧠", done: false },
    { id: "2", title: "Drink 2L water 💧", done: true },
    { id: "3", title: "Review strategic goals 🎯", done: false },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [habitStreak, setHabitStreak] = useState(5);
  const [habitDone, setHabitDone] = useState(false);
  const [aiTip, setAiTip] = useState("Your cognitive state is ready for deep planning. Complete tasks below!");

  const handleToggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextState = !t.done;
          if (nextState) {
            triggerConfetti();
            setAiTip("🔥 Nice work! Task completed. Neural connection strengthened.");
          }
          return { ...t, done: nextState };
        }
        return t;
      })
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: Math.random().toString(),
      title: newTaskTitle,
      done: false,
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle("");
    setAiTip("🚀 New task injected successfully into your cognitive queue.");
  };

  const handleRemoveTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setAiTip("🗑️ Task discarded from neural registry.");
  };

  const handleToggleHabit = () => {
    if (!habitDone) {
      setHabitStreak(s => s + 1);
      setHabitDone(true);
      triggerConfetti();
      setAiTip("✨ Habit matrix updated! Streak multiplier increased.");
    } else {
      setHabitStreak(s => Math.max(0, s - 1));
      setHabitDone(false);
      setAiTip("⚠️ Streak resetting to baseline. Keep habits consistent!");
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#7c7cff", "#10b981", "#ff7c7c", "#ffc87c"],
    });
  };

  const completedCount = tasks.filter(t => t.done).length;
  const progressPercent = Math.round(((completedCount + (habitDone ? 1 : 0)) / (tasks.length + 1)) * 100);

  return (
    <Card className="glass shadow-2xl relative overflow-hidden border-border/80 w-full max-w-lg mx-auto bg-card/75 backdrop-blur-xl">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Header bar */}
      <div className="px-4 py-3.5 border-b border-border/60 flex items-center justify-between bg-background/40">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/90 pl-2">Live Preview Sandbox</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          {progressPercent}% Efficiency
        </div>
      </div>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Mock AI Suggestion */}
        <div className="bg-primary/5 border border-primary/15 rounded-xl p-3 flex items-start gap-2.5 transition-all duration-300">
          <Terminal className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <div className="font-bold text-foreground">AI Neural Coach:</div>
            <div className="text-muted-foreground leading-relaxed transition-all duration-300">{aiTip}</div>
          </div>
        </div>

        {/* Habits interactive widget */}
        <div className="bg-card/50 border border-border/40 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl transition-colors ${habitDone ? "bg-orange-500/20 text-orange-500" : "bg-muted text-muted-foreground"}`}>
              <Flame className={`w-5 h-5 ${habitDone ? "animate-bounce" : ""}`} />
            </div>
            <div>
              <h4 className="text-xs font-bold">Daily Habit Tracker</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Consistency builds core routines.</p>
            </div>
          </div>

          <button
            onClick={handleToggleHabit}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 ${
              habitDone
                ? "bg-orange-500 text-orange-foreground border-orange-600 shadow-lg shadow-orange-500/20 scale-102"
                : "bg-background hover:bg-accent border-border/80"
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            {habitStreak} Day Streak
          </button>
        </div>

        {/* Task list interactive widget */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1">Today's Tasks</h4>
          
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
            {tasks.map(t => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 ${
                  t.done
                    ? "bg-muted/30 border-muted text-muted-foreground"
                    : "bg-background border-border/60 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => handleToggleTask(t.id)}
                    className="focus:outline-none shrink-0"
                    aria-label={`Toggle task: ${t.title}`}
                  >
                    <CheckCircle className={`w-4 h-4 transition-colors ${t.done ? "text-primary fill-primary/10" : "text-muted-foreground hover:text-primary"}`} />
                  </button>
                  <span className={`text-xs truncate ${t.done ? "line-through" : ""}`}>{t.title}</span>
                </div>
                <button
                  onClick={() => handleRemoveTask(t.id)}
                  className="p-1 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                  aria-label={`Delete task: ${t.title}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>

          <form onSubmit={handleAddTask} className="flex gap-1.5 mt-2.5">
            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="e.g. Meditate for 10 min..."
              className="flex-1 text-xs bg-background border border-border/60 rounded-xl px-3 py-2 focus:outline-none focus:border-primary/50"
            />
            <Button type="submit" size="sm" className="h-8.5 rounded-xl px-3 bg-primary text-primary-foreground">
              <Plus className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

/* ───────────────────────────────────────────
   Animated Counter Hook
   ─────────────────────────────────────────── */
function useAnimatedCounter(target: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [hasStarted, target, duration]);

  return { count, setHasStarted };
}

/* ───────────────────────────────────────────
   Stats Counter Component
   ─────────────────────────────────────────── */
function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, setHasStarted } = useAnimatedCounter(value, 2000);
  return (
    <motion.div
      className="text-center px-4 py-2"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      onViewportEnter={() => setHasStarted(true)}
    >
      <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs sm:text-sm text-white/70 font-semibold mt-1">{label}</div>
    </motion.div>
  );
}

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [, setLocation] = useLocation();
  const { user, loginWithGoogle } = useAuth();

  const handleStart = async () => {
    if (user) {
      setLocation("/dashboard");
    } else {
      try {
        await loginWithGoogle();
        setLocation("/dashboard");
      } catch (err) {
        toast.error("Bypass mode failed. Please refresh and try again.");
      }
    }
  };

  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Infinitodo — AI-Powered To-Do List, Habit Tracker & Focus Timer";

    // Enable smooth scrolling on html
    document.documentElement.style.scrollBehavior = "smooth";

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "Infinitodo is a free AI-powered productivity platform. Manage tasks, build daily habits, set focus timers, and get AI-driven performance insights — all in one beautiful app.";

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin;

    // OG Tags
    const setOg = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };
    setOg("og:title", "Infinitodo — Your Productivity, Supercharged with AI");
    setOg("og:description", "Free AI-powered task management, habit tracking, and focus timer. Join 10K+ users building better daily routines.");
    setOg("og:type", "website");
    setOg("og:url", window.location.origin);

    return () => {
      document.title = prevTitle;
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  const howItWorksSteps = [
    {
      num: 1,
      icon: CheckSquare,
      title: "Create Your Tasks",
      desc: "Add tasks with priorities, categories, and deadlines. Our AI automatically organizes them into an optimal execution sequence.",
    },
    {
      num: 2,
      icon: Flame,
      title: "Build Daily Habits",
      desc: "Set up recurring habits with streak tracking. Watch your consistency compound as you build powerful daily routines.",
    },
    {
      num: 3,
      icon: Brain,
      title: "Track & Optimize",
      desc: "Get AI-powered insights into your productivity patterns, peak focus windows, and personalized improvement strategies.",
    },
  ];

  return (
    <div className="selection:bg-primary/20 selection:text-primary relative overflow-hidden" id="landing-page-root">

      {/* ═══════════════════════════════════════
          FIXED NAVBAR
          ═══════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 p-0.5 shadow-md shadow-primary/10 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Infinitodo Logo" className="w-full h-full object-contain rounded-[9px] bg-background" />
            </div>
            <span className="font-black text-base sm:text-lg tracking-tighter bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-500 bg-clip-text text-transparent uppercase leading-none">
              INFINITODO
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a>
            <a href="#benefits" className="hover:text-foreground transition-colors duration-200">Benefits</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors duration-200">How It Works</a>
            <a href="#faq" className="hover:text-foreground transition-colors duration-200">FAQ</a>
          </nav>

          {/* CTA Button */}
          <Button
            onClick={handleStart}
            size="sm"
            className="h-9 px-5 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600 hover:from-teal-600 hover:via-emerald-600 hover:to-indigo-700 text-white shadow-lg shadow-teal-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30"
          >
            {user ? "Dashboard" : "Launch App"}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* Content wrapper with top padding for fixed navbar */}
      <div className="pt-20 space-y-0">

        {/* ═══════════════════════════════════════
            HERO SECTION
            ═══════════════════════════════════════ */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
          {/* Animated Floating Gradient Orbs */}
          <motion.div
            className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-teal-500/20 via-emerald-500/10 to-transparent blur-[100px] pointer-events-none"
            animate={{
              x: [0, 60, -30, 0],
              y: [0, -40, 30, 0],
              scale: [1, 1.15, 0.95, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[-10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-600/15 via-violet-500/10 to-transparent blur-[120px] pointer-events-none"
            animate={{
              x: [0, -50, 40, 0],
              y: [0, 50, -30, 0],
              scale: [1, 0.9, 1.1, 1],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-emerald-400/10 via-teal-500/5 to-transparent blur-[80px] pointer-events-none"
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -60, 20, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10 w-full">

            {/* Copy Column */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              {/* Pill Badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm text-primary text-xs sm:text-sm font-semibold mx-auto lg:mx-0 shadow-sm"
              >
                <Sparkles className="h-4 w-4 animate-pulse" />
                ✨ #1 AI Productivity Platform — Free Forever
              </motion.div>

              {/* Hero Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9] text-foreground"
                id="landing-hero-title"
              >
                Your Productivity,{" "}
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600 bg-clip-text text-transparent">
                  Supercharged with AI
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                The all-in-one workspace where tasks, habits, and focus converge. Powered by
                intelligent AI that learns your rhythm and helps you achieve more every single day.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-stretch sm:items-center"
              >
                <Button
                  onClick={handleStart}
                  id="btn-get-started-hero"
                  size="lg"
                  className="h-13 px-8 text-sm font-bold bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600 hover:from-teal-600 hover:via-emerald-600 hover:to-indigo-700 text-white rounded-2xl shadow-xl shadow-teal-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {user ? "Enter Dashboard" : "Start Free — No Card Required"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <a href="#features" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="w-full sm:w-auto h-13 px-8 text-sm font-bold rounded-2xl hover:bg-accent/50 gap-2"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Watch Demo ▶
                  </Button>
                </a>
              </motion.div>

              {/* Social Proof Row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <span className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm border border-border/50 px-4 py-2 rounded-full text-sm font-semibold text-foreground shadow-sm">
                  {[0, 1, 2, 3, 4].map(i => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1">4.9★ Rating</span>
                </span>
                <span className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm border border-border/50 px-4 py-2 rounded-full text-sm font-semibold text-foreground shadow-sm">
                  <Zap className="h-3.5 w-3.5 text-emerald-500" />
                  10K+ Users
                </span>
                <span className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm border border-border/50 px-4 py-2 rounded-full text-sm font-semibold text-foreground shadow-sm">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  100% Free
                </span>
              </motion.div>
            </div>

            {/* Interactive Preview Column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
              className="lg:col-span-5 flex justify-center w-full"
            >
              <InteractivePreviewWidget />
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            STATS / METRICS BANNER
            ═══════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-700 py-12 sm:py-16">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 relative z-10">
              <StatCounter value={50000} suffix="+" label="Tasks Completed" />
              <StatCounter value={12000} suffix="+" label="Habits Tracked" />
              <StatCounter value={99} suffix=".9%" label="Uptime" />
              <StatCounter value={4} suffix=".9★" label="Average Rating" />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FEATURES SECTION
            ═══════════════════════════════════════ */}
        <section id="features" className="scroll-mt-24 py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-16">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-foreground"
              >
                Everything You Need to{" "}
                <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600 bg-clip-text text-transparent">
                  Execute
                </span>
              </motion.h2>
              <div className="w-20 h-1 mx-auto rounded-full bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600" />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-base sm:text-lg"
              >
                Forget messy tabs and fragmented planners. Infinitodo unifies the only execution vectors that matter to your daily output.
              </motion.p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  whileHover={{ y: -8, transition: { duration: 0.25 } }}
                >
                  <Card className="h-full border border-border/60 hover:border-primary/30 bg-card/60 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${f.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                    <CardContent className="p-6 sm:p-7 space-y-4">
                      <div className={`inline-flex p-3.5 rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-lg ${f.shadow} group-hover:scale-110 transition-transform duration-300`}>
                        <f.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-lg text-foreground tracking-tight">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            BENEFITS SECTION
            ═══════════════════════════════════════ */}
        <section id="benefits" className="scroll-mt-24 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto space-y-16 relative z-10">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-foreground"
              >
                Why Teams{" "}
                <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600 bg-clip-text text-transparent">
                  Love
                </span>{" "}
                Infinitodo
              </motion.h2>
              <div className="w-20 h-1 mx-auto rounded-full bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600" />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-base sm:text-lg"
              >
                Discover a friction-free productivity loop engineered for daily consistency.
              </motion.p>
            </div>

            {/* Benefits Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group"
                >
                  <div className="flex gap-4 p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl hover:border-primary/30 hover:bg-card/60 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 h-full">
                    <div className="shrink-0 h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-500/15 to-indigo-600/15 border border-primary/20 text-primary flex items-center justify-center font-bold text-lg shadow-inner group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base sm:text-lg text-foreground">{b.title}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/15">{b.tag}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{b.body}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            HOW IT WORKS SECTION
            ═══════════════════════════════════════ */}
        <section id="how-it-works" className="scroll-mt-24 py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-16">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-foreground"
              >
                How It{" "}
                <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600 bg-clip-text text-transparent">
                  Works
                </span>
              </motion.h2>
              <div className="w-20 h-1 mx-auto rounded-full bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600" />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-base sm:text-lg"
              >
                Three simple steps to transform your daily productivity forever.
              </motion.p>
            </div>

            {/* Steps */}
            <div className="relative">
              {/* Connecting gradient line (desktop) */}
              <div className="hidden md:block absolute top-16 left-[16.666%] right-[16.666%] h-0.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600 opacity-30" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
                {howItWorksSteps.map((step, i) => (
                  <motion.div
                    key={step.num}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    className="text-center space-y-5 relative"
                  >
                    {/* Numbered Circle */}
                    <div className="relative inline-flex">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 via-emerald-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-teal-500/20 mx-auto relative z-10">
                        <span className="text-xl font-black text-white">{step.num}</span>
                      </div>
                      {/* Pulse ring */}
                      <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 animate-ping opacity-20" />
                    </div>

                    {/* Icon */}
                    <div className="inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/15 text-primary mx-auto">
                      <step.icon className="h-6 w-6" />
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FAQ SECTION
            ═══════════════════════════════════════ */}
        <section id="faq" className="scroll-mt-24 py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-12">
            {/* Section Header */}
            <div className="text-center space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-foreground flex items-center justify-center gap-3"
              >
                <HelpCircle className="w-8 h-8 text-primary" />
                Frequently Asked Questions
              </motion.h2>
              <div className="w-20 h-1 mx-auto rounded-full bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600" />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-base sm:text-lg"
              >
                Everything you need to know about getting started.
              </motion.p>
            </div>

            {/* FAQ Items */}
            <div className="space-y-3">
              {faqs.map((f, i) => {
                const isOpen = openFaq === i;
                return (
                  <motion.div
                    key={f.q}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="overflow-hidden border border-border/60 bg-card/50 backdrop-blur-sm shadow-sm hover:border-primary/20 transition-colors duration-300">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-accent/30 transition-colors focus:outline-none min-h-[56px]"
                        aria-expanded={isOpen}
                        data-testid={`faq-toggle-${i}`}
                      >
                        <span className="font-semibold text-base text-foreground leading-snug">{f.q}</span>
                        <ChevronDown
                          className={`h-5 w-5 text-primary shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      <motion.div
                        initial={false}
                        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                      </motion.div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            BOTTOM CTA SECTION
            ═══════════════════════════════════════ */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-emerald-600 to-indigo-700 text-white p-10 sm:p-16 text-center shadow-2xl"
          >
            {/* Background elements */}
            <div className="absolute top-[-30%] left-[-20%] w-[60vw] h-[60vw] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-30%] right-[-20%] w-[60vw] h-[60vw] bg-amber-400/10 rounded-full blur-[100px] pointer-events-none" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-teal-400/10 via-emerald-400/5 to-indigo-400/10"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
                Ready to Supercharge Your Productivity?
              </h2>
              <p className="text-base sm:text-lg opacity-90 leading-relaxed max-w-xl mx-auto">
                Join thousands of focused professionals already using Infinitodo to accomplish more every day. It's free, forever.
              </p>
              <div className="relative inline-block">
                {/* Pulsing glow behind button */}
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl animate-pulse" />
                <Button
                  onClick={handleStart}
                  id="btn-get-started-cta"
                  size="lg"
                  className="relative h-14 px-10 text-base font-bold bg-white text-teal-700 hover:bg-white/95 shadow-2xl shadow-black/20 hover:shadow-3xl transition-all duration-300 hover:scale-105 active:scale-95 rounded-2xl"
                >
                  {user ? "Go to Dashboard" : "Start Free — No Card Required"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════
            FOOTER
            ═══════════════════════════════════════ */}
        <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
              {/* Brand */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 p-0.5 shadow-md flex items-center justify-center">
                    <img src="/logo.png" alt="Infinitodo" className="w-full h-full object-contain rounded-[9px] bg-background" />
                  </div>
                  <span className="font-black text-lg tracking-tighter bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-500 bg-clip-text text-transparent uppercase">
                    INFINITODO
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  The AI-powered productivity platform that helps you manage tasks, build habits, and achieve peak performance.
                </p>
              </div>

              {/* Quick Links */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">Quick Links</h4>
                <nav className="flex flex-col gap-2">
                  <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
                  <a href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Benefits</a>
                  <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
                  <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
                </nav>
              </div>

              {/* Built With */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">About</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Built with ❤️ for productivity enthusiasts who believe in the power of daily habits and focused execution.
                </p>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                © 2024–2026 Infinitodo. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground">
                Made with <span className="text-red-500">❤</span> for builders & dreamers
              </p>
            </div>
          </div>
        </footer>

      </div>{/* end content wrapper */}
    </div>
  );
}
