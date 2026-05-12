import { motion } from "framer-motion";
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  Target, 
  Clock, 
  Flame, 
  ShieldCheck, 
  AlertCircle,
  Award,
  ArrowUpRight,
  BarChart3,
  Timer,
  Activity,
  Sparkles,
  PieChart,
  Trophy as TrophyIcon,
  Medal,
  Sun
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  useGetDashboardSummary, 
  useListHabits,
  useGetWeeklyReport,
  getGetDashboardSummaryQueryKey,
  getListHabitsQueryKey,
  getGetWeeklyReportQueryKey
} from "@workspace/api-client-react";
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
  Cell
} from "recharts";
import { cn } from "@/lib/utils";
import { PerspectiveCard } from "@/components/perspective-card";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";

type Insight = {
  title: string;
  message: string;
  icon: any;
  color: string;
  type: 'improvement' | 'warning' | 'achievement' | 'analysis';
};

const LEVEL_RANKS = [
  { name: "Novice", minScore: 0, color: "text-slate-400", bg: "bg-slate-400/10" },
  { name: "Building Momentum", minScore: 20, color: "text-blue-400", bg: "bg-blue-400/10" },
  { name: "Consistent Performer", minScore: 50, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { name: "Deep Focused", minScore: 75, color: "text-indigo-400", bg: "bg-indigo-400/10" },
  { name: "Discipline Master", minScore: 90, color: "text-amber-400", bg: "bg-amber-400/10" },
];

export function IntelligenceView({ onBack }: { onBack?: () => void }) {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() },
  });
  const { data: habits, isLoading: loadingHabits } = useListHabits({
    query: { queryKey: getListHabitsQueryKey() },
  });
  const { data: report, isLoading: loadingReport } = useGetWeeklyReport({
    query: { queryKey: getGetWeeklyReportQueryKey() },
  });

  const [isSyncing, setIsSyncing] = useState(false);

  const analytics = useMemo(() => {
    if (!summary || !report || !habits) return null;

    const prodScore = summary.productivityScore || 0;
    const habitsTotal = summary.habitsTotal || 0;
    const habitsCompletedToday = summary.habitsCompletedToday || 0;
    const habitCompletionRate = habitsTotal > 0 ? (habitsCompletedToday / habitsTotal) * 100 : 0;
    
    const habitsList = Array.isArray(habits) ? habits : [];
    const avgStreak = habitsList.length > 0 ? habitsList.reduce((acc: number, h: any) => acc + (h.streak || 0), 0) / habitsList.length : 0;
    const disciplineScore = Math.min(100, Math.round((habitCompletionRate * 0.6) + (avgStreak * 2)));
    const focusConsistency = 85; 

    const last7Days = report.days || [];
    const recentAvg = last7Days.slice(-3).reduce((acc: number, d: any) => acc + (d.completed || 0), 0) / Math.max(last7Days.slice(-3).length, 1);
    const priorAvg = last7Days.slice(0, 3).reduce((acc: number, d: any) => acc + (d.completed || 0), 0) / Math.max(last7Days.slice(0, 3).length, 1);
    const improvement = priorAvg > 0 ? ((recentAvg - priorAvg) / priorAvg) * 100 : 0;

    const peakHours = "09:00 AM - 12:00 PM";
    const burnoutRisk = (recentAvg > 10 && improvement < -20) ? 'High' : (recentAvg > 8) ? 'Moderate' : 'Low';
    const currentRank = LEVEL_RANKS.slice().reverse().find(r => prodScore >= r.minScore) || LEVEL_RANKS[0];

    const generatedInsights: Insight[] = [];
    if (improvement > 10) {
      generatedInsights.push({
        title: "Upward Momentum",
        message: `Your productivity increased by ${Math.round(improvement)}% this week.`,
        icon: TrendingUp,
        color: "text-emerald-500",
        type: 'improvement'
      });
    }
    if (burnoutRisk === 'High') {
      generatedInsights.push({
        title: "Burnout Alert",
        message: "High output detected. Schedule a recovery day.",
        icon: AlertCircle,
        color: "text-rose-500",
        type: 'warning'
      });
    }
    if (disciplineScore > 80) {
      generatedInsights.push({
        title: "Iron Discipline",
        message: "Your habit consistency is exceptional.",
        icon: ShieldCheck,
        color: "text-amber-500",
        type: 'achievement'
      });
    }
    generatedInsights.push({
      title: "Peak Performance",
      message: `Deep focus window: ${peakHours}.`,
      icon: Clock,
      color: "text-blue-500",
      type: 'analysis'
    });

    const achievements = [];
    if (prodScore >= 90) achievements.push({ name: "Focus Titan", date: "Today", icon: TrophyIcon, color: "text-amber-500" });
    if (avgStreak >= 7) achievements.push({ name: "Consistency King", date: "Yesterday", icon: Medal, color: "text-blue-500" });

    return {
      prodScore,
      disciplineScore,
      focusConsistency,
      improvement,
      burnoutRisk,
      currentRank,
      insights: generatedInsights,
      achievements,
      stats: [
        { label: "Productivity", value: prodScore, icon: Zap, color: "text-blue-500", detail: "Tasks & Sessions" },
        { label: "Discipline", value: disciplineScore, icon: ShieldCheck, color: "text-amber-500", detail: "Habit Consistency" },
        { label: "Consistency", value: focusConsistency, icon: Target, color: "text-emerald-500", detail: "Focus Reliability" },
        { label: "Growth", value: `${Math.round(improvement)}%`, icon: TrendingUp, color: "text-indigo-500", detail: "Improvement" },
      ]
    };
  }, [summary, report, habits]);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  if (loadingSummary || loadingReport || loadingHabits) {
    return <div className="h-96 flex items-center justify-center"><Brain className="w-12 h-12 text-primary animate-pulse" /></div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 animate-in fade-in duration-700"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">AI Performance Intelligence</div>
            <div className={cn("px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest", analytics?.currentRank?.bg, analytics?.currentRank?.color)}>
              {analytics?.currentRank?.name}
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">System Analysis</h1>
        </div>
        <div className="flex gap-2">
          {onBack && <Button variant="outline" onClick={onBack} className="rounded-xl font-bold uppercase tracking-widest text-[10px]">Back to Hub</Button>}
          <Button onClick={handleSync} disabled={isSyncing} className="rounded-xl gap-2 shadow-lg shadow-primary/20">
            <Brain className={cn("w-4 h-4", isSyncing && "animate-spin")} />
            {isSyncing ? "Analyzing..." : "Refresh Intelligence"}
          </Button>
        </div>
      </div>

      {/* CORE METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {analytics?.stats.map((stat, i) => (
          <PerspectiveCard key={i}>
            <Card className="border-border bg-card shadow-sm hover:shadow-md transition-all group overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("p-2 rounded-xl bg-background border border-border", stat.color)}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                </div>
                <div className="text-2xl font-black tabular-nums">{stat.value}{typeof stat.value === 'number' && '%'}</div>
              </CardContent>
            </Card>
          </PerspectiveCard>
        ))}
      </div>

      {/* MAIN ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="h-full border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">Productivity Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={report?.days ?? []}>
                    <defs>
                      <linearGradient id="colorTasksInt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Area type="monotone" dataKey="completed" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorTasksInt)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border bg-card shadow-sm overflow-hidden relative">
            <CardHeader>
              <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics?.insights.map((insight, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-background/50 border border-border">
                  <insight.icon className={cn("w-4 h-4 shrink-0", insight.color)} />
                  <div className="space-y-0.5">
                    <h4 className="text-[10px] font-bold">{insight.title}</h4>
                    <p className="text-[9px] text-muted-foreground leading-tight">{insight.message}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
