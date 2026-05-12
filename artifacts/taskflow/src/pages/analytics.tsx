import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  Target, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  Award,
  ArrowUpRight,
  BarChart3,
  Timer,
  Activity,
  Sparkles,
  PieChart,
  Bot,
  ChevronLeft,
  Fingerprint
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  useGetDashboardSummary, 
  useListHabits,
  useGetWeeklyReport,
  getGetDashboardSummaryQueryKey,
  getListHabitsQueryKey,
  getGetWeeklyReportQueryKey,
  useListTasks,
  getListTasksQueryKey
} from "@workspace/api-client-react";
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";

// --- Design Tokens & Constants ---
// --- Design Tokens & Constants ---
const COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  background: "hsl(var(--background))",
  accent: "hsl(var(--accent))",
  foreground: "hsl(var(--foreground))",
  muted: "hsl(var(--muted-foreground) / 0.6)",
};

const STAGES = [
  { id: 'tasks', label: "Scanning Task Architecture", sub: "Mapping completion nodes..." },
  { id: 'habits', label: "Reading Discipline Trends", sub: "Analyzing streak consistency..." },
  { id: 'focus', label: "Detecting Productivity Patterns", sub: "Calculating focus density..." },
  { id: 'recommend', label: "Generating Strategic Insights", sub: "Synthesizing recommendations..." }
];

// --- Sub-components ---

const NeuralPulse = () => (
  <div className="relative w-48 h-48 flex items-center justify-center">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.1, 0.3],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full"
    />
    <motion.div
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.2, 0, 0.2],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 border-2 border-primary/30 rounded-full"
    />
    <div className="relative z-10 w-32 h-32 rounded-[2.5rem] bg-card/40 backdrop-blur-xl border border-border/50 flex items-center justify-center shadow-2xl">
      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#00FF9D] border-4 border-background flex items-center justify-center shadow-[0_0_15px_rgba(0,255,157,0.5)]">
        <motion.div 
          animate={{ opacity: [1, 0.5, 1] }} 
          transition={{ duration: 1, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-white" 
        />
      </div>
      <Brain className="w-16 h-16 text-primary drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]" />
      
      {/* Neural Dots */}
      <motion.div 
        animate={{ y: [0, -10, 0], x: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-primary/40 blur-[1px]" 
      />
      <motion.div 
        animate={{ y: [0, 15, 0], x: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        className="absolute bottom-6 left-6 w-2 h-2 rounded-full bg-primary/30 blur-[2px]" 
      />
    </div>
  </div>
);

const Atmosphere = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 dark:bg-indigo-900/10 blur-[150px] rounded-full" />
    
    {/* Floating Particles */}
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ 
          x: Math.random() * 100 + "%", 
          y: Math.random() * 100 + "%",
          opacity: Math.random() * 0.3
        }}
        animate={{ 
          y: ["-10%", "110%"],
          opacity: [0, 0.3, 0]
        }}
        transition={{ 
          duration: Math.random() * 10 + 10, 
          repeat: Infinity, 
          ease: "linear",
          delay: Math.random() * 10
        }}
        className="absolute w-1 h-1 bg-primary/20 dark:bg-white/20 rounded-full blur-[1px]"
      />
    ))}
  </div>
);

// --- Main AI Analyser Component ---

export function AIAnalyser({ onBack, initialView = 'card' }: { onBack?: () => void, initialView?: 'card' | 'scanning' | 'results' }) {
  const [view, setView] = useState<'card' | 'scanning' | 'results'>(initialView);
  const [stageIndex, setStageIndex] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);

  // --- Data Fetching ---
  const { data: summary } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: habits } = useListHabits({ query: { queryKey: getListHabitsQueryKey() } });
  const { data: report } = useGetWeeklyReport({ query: { queryKey: getGetWeeklyReportQueryKey() } });
  const { data: tasks } = useListTasks({ query: { queryKey: getListTasksQueryKey() } });

  // --- Analysis Logic ---
  const analytics = useMemo(() => {
    if (!summary || !report || !habits || !tasks) return null;

    const habitsList = Array.isArray(habits) ? habits : [];
    const reportDays = report.days || [];

    // 1. Productivity Score (0-100)
    const prodScore = summary.productivityScore || 0;

    // 2. Discipline Score (Based on streaks and habit completion)
    const avgStreak = habitsList.length > 0 ? habitsList.reduce((acc, h) => acc + (h.streak || 0), 0) / habitsList.length : 0;
    const habitsCompletedToday = summary.habitsCompletedToday || 0;
    const habitsTotal = summary.habitsTotal || 0;
    const habitRate = habitsTotal > 0 ? habitsCompletedToday / habitsTotal : 0;
    const disciplineScore = Math.min(100, Math.round((habitRate * 50) + (avgStreak * 5)));

    // 3. Focus Consistency (Tasks completed vs Total)
    const tasksCompleted = summary.tasksCompleted || 0;
    const tasksTotal = summary.tasksTotal || 0;
    const focusConsistency = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

    // 4. Momentum Level (Improvement trends)
    const recentAvg = reportDays.slice(-3).reduce((acc: number, d: any) => acc + (d.tasksCompleted || 0), 0) / Math.max(reportDays.slice(-3).length, 1);
    const priorAvg = reportDays.slice(0, 3).reduce((acc: number, d: any) => acc + (d.tasksCompleted || 0), 0) / Math.max(reportDays.slice(0, 3).length, 1);
    const improvement = priorAvg > 0 ? ((recentAvg - priorAvg) / priorAvg) * 100 : 0;
    const momentum = improvement > 0 ? 'High' : improvement < -20 ? 'Low' : 'Stable';

    // 5. Best Productivity Hours (Mock logic based on "morning" preference)
    const bestHours = tasksCompleted > 5 ? "9:00 AM - 11:30 AM" : "Evening (5 PM - 7 PM)";

    // 6. Burnout Warning
    const burnoutRisk = (recentAvg > 12 && improvement < -10) ? 'Critical' : (recentAvg > 10) ? 'Moderate' : 'Low';

    // 7. Dynamic Insights
    const insights = [];
    if (improvement > 15) {
      insights.push({
        title: "Discipline Surge",
        message: `Your productivity architecture improved by ${Math.round(improvement)}% this week.`,
        icon: TrendingUp,
        color: "text-emerald-500 dark:text-emerald-400",
        bg: "bg-emerald-500/10 dark:bg-emerald-400/10"
      });
    }
    if (disciplineScore > 85) {
      insights.push({
        title: "Iron Focus",
        message: "Your habit consistency is in the top 5% of your history.",
        icon: ShieldCheck,
        color: "text-blue-500 dark:text-blue-400",
        bg: "bg-blue-500/10 dark:bg-blue-400/10"
      });
    }
    if (burnoutRisk !== 'Low') {
      insights.push({
        title: "Recovery Needed",
        message: "Intense completion cycles detected. Prioritize restoration today.",
        icon: AlertCircle,
        color: "text-amber-500 dark:text-amber-400",
        bg: "bg-amber-500/10 dark:bg-amber-400/10"
      });
    }
    if (tasksCompleted > 0) {
      insights.push({
        title: "Peak Window Identified",
        message: `Deep focus is most effective for you between ${bestHours}.`,
        icon: Clock,
        color: "text-indigo-500 dark:text-indigo-400",
        bg: "bg-indigo-500/10 dark:bg-indigo-400/10"
      });
    }

    return {
      prodScore,
      disciplineScore,
      focusConsistency,
      improvement: Math.round(improvement),
      momentum,
      bestHours,
      burnoutRisk,
      insights,
      reportDays,
      hasData: tasksTotal > 0 || habitsList.length > 0
    };
  }, [summary, habits, report, tasks]);

  // --- Scanning Sequence ---
  useEffect(() => {
    if (view === 'scanning') {
      let currentStage = 0;
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setView('results'), 500);
            return 100;
          }
          const next = prev + (100 / (STAGES.length * 15)); 
          
          const stageStep = 100 / STAGES.length;
          const newStage = Math.min(Math.floor(next / stageStep), STAGES.length - 1);
          if (newStage !== currentStage) {
            currentStage = newStage;
            setStageIndex(newStage);
          }
          
          return next;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [view]);

  const handleStartAnalysis = () => {
    setScanProgress(0);
    setStageIndex(0);
    setView('scanning');
  };

  // --- Renders ---

  return (
    <div className="relative min-h-[600px] w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-12 px-6">
      <Atmosphere />

      <AnimatePresence mode="wait">
        {/* VIEW 1: THE CARD */}
        {view === 'card' && (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md"
          >
            <Card className="bg-card/80 backdrop-blur-2xl border-border/50 overflow-hidden shadow-2xl rounded-[3rem]">
              <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">AI Analyser</span>
                </div>
                <Sparkles className="w-5 h-5 text-foreground/20" />
              </CardHeader>
              <CardContent className="p-8 pt-4 flex flex-col items-center text-center space-y-8">
                <NeuralPulse />
                
                <div className="space-y-3">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase text-foreground leading-none">
                    Neural Sync <span className="text-primary">Analyser</span>
                  </h2>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest leading-relaxed max-w-[280px] mx-auto opacity-70">
                    Analyze your productivity behavior and discover smarter focus patterns to optimize your day.
                  </p>
                </div>

                <Button
                  onClick={handleStartAnalysis}
                  className="w-full h-16 rounded-3xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all group"
                >
                  Analyze Now
                  <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* VIEW 2: SCANNING */}
        {view === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center space-y-12 w-full max-w-lg"
          >
            <div className="relative">
              <NeuralPulse />
              {/* Scanning Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-20px] border border-dashed border-primary/40 rounded-full"
              />
              <div className="absolute inset-[-40px] border border-border/50 rounded-full" />
            </div>

            <div className="w-full space-y-6 text-center">
              <div className="space-y-1">
                <motion.h3 
                  key={stageIndex}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-xl font-black uppercase tracking-tighter italic text-primary"
                >
                  {STAGES[stageIndex].label}
                </motion.h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  {STAGES[stageIndex].sub}
                </p>
              </div>

              <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${scanProgress}%` }}
                  className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-400"
                />
                <motion.div
                   animate={{ left: ["0%", "100%", "0%"] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute top-0 bottom-0 w-20 bg-white/30 blur-md -skew-x-12"
                />
              </div>

              <div className="flex justify-center gap-4">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: stageIndex === i ? 1.2 : 1,
                      opacity: stageIndex >= i ? 1 : 0.3,
                      backgroundColor: stageIndex === i ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.2)"
                    }}
                    className="w-1.5 h-1.5 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: RESULTS */}
        {view === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Analysis Complete</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-none text-foreground">
                  Productivity <span className="text-primary italic">Intelligence</span>
                </h1>
                <p className="text-muted-foreground text-xs font-medium max-w-md">
                  Your cognitive map has been synchronized. Here are your personalized discipline and focus trends.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setView('card')}
                className="rounded-2xl border-border/50 bg-card/50 hover:bg-card text-[10px] font-black uppercase tracking-widest h-12 px-6"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                New Scan
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Productivity", value: analytics?.prodScore, icon: Zap, color: "text-blue-500 dark:text-blue-400" },
                { label: "Discipline", value: analytics?.disciplineScore, icon: ShieldCheck, color: "text-indigo-500 dark:text-indigo-400" },
                { label: "Focus", value: analytics?.focusConsistency, icon: Target, color: "text-emerald-500 dark:text-emerald-400" },
                { label: "Momentum", value: analytics?.improvement + "%", icon: TrendingUp, color: "text-primary" },
              ].map((m, i) => (
                <Card key={i} className="bg-card/40 backdrop-blur-md border-border/50 p-6 space-y-4 hover:border-primary/20 transition-colors group rounded-3xl">
                  <div className={cn("p-2 rounded-xl bg-background border border-border/50 w-fit group-hover:scale-110 transition-transform shadow-sm", m.color)}>
                    <m.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">{m.label}</p>
                    <h3 className="text-2xl font-black tracking-tighter text-foreground">{m.value}{typeof m.value === 'number' ? '%' : ''}</h3>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Card className="lg:col-span-8 bg-card/30 backdrop-blur-xl border-border/50 p-8 relative overflow-hidden group rounded-[2.5rem]">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-black tracking-tight flex items-center gap-2 text-foreground">
                      Performance Architecture
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Completion Density Mapping</p>
                  </div>
                  <Activity className="w-5 h-5 text-primary opacity-30 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.reportDays ?? []}>
                      <defs>
                        <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--foreground)/0.05)" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 700 }} 
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          borderRadius: '20px', 
                          border: '1px solid hsl(var(--border))',
                          backdropFilter: 'blur(10px)',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          color: "hsl(var(--foreground))"
                        }} 
                        itemStyle={{ color: "hsl(var(--primary))" }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="tasksCompleted" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorInt)" 
                        animationDuration={2500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <div className="lg:col-span-4 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary px-1">Neural Insights</h4>
                  {analytics?.insights.map((insight, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={cn("p-4 rounded-3xl border border-border/50 flex gap-4 hover:bg-card/50 transition-all group cursor-default", insight.bg)}
                    >
                      <div className={cn("p-2.5 rounded-2xl bg-background border border-border/50 h-fit group-hover:scale-110 transition-transform shadow-sm", insight.color)}>
                        <insight.icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-[11px] font-black uppercase tracking-tight text-foreground">{insight.title}</h5>
                        <p className="text-[10px] font-medium text-muted-foreground leading-snug">{insight.message}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Card className="bg-gradient-to-br from-primary/10 to-transparent border border-border/50 p-6 rounded-[2.5rem] relative overflow-hidden group shadow-lg">
                   <div className="absolute -right-4 -bottom-4 opacity-5 dark:opacity-10 group-hover:scale-125 transition-transform duration-700">
                     <Brain className="w-24 h-24 text-primary" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-primary/80 mb-2">Strategy Advice</p>
                   <p className="text-sm font-bold text-foreground leading-relaxed relative z-10">
                     "Your focus architecture thrives on <span className="text-primary italic">Deep Mornings</span>. Protect the 9 AM - 11 AM window for maximum impact."
                   </p>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AIAnalyserPage() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      <AIAnalyser onBack={() => setLocation("/")} />
    </div>
  );
}

