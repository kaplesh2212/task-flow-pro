import { Link, useLocation } from "wouter"
import { LayoutDashboard, CheckSquare, Activity, Bell, Settings, Sparkles, Timer, Send, Brain } from "lucide-react"
import { FaTelegram } from "react-icons/fa"
import { cn } from "@/lib/utils"
import { PerspectiveCard } from "./perspective-card"
import { ThemeToggle } from "./theme-toggle"
import { useEffect, useState } from "react"
import { useListReminders, getListRemindersQueryKey } from "@workspace/api-client-react"
import { ReminderAlert } from "./reminder-alert"
import { sfx } from "@/lib/sfx"
import { ExternalAd } from "./external-ad"
import { InstallPWA } from "./install-pwa"
import { motion, AnimatePresence } from "framer-motion"
import { PlayCircle, PauseCircle, CloudDownload, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

function GlobalReminder() {
  const { data: reminders } = useListReminders({
    query: { queryKey: getListRemindersQueryKey(), refetchInterval: 10000 },
  })
  const [activeAlert, setActiveAlert] = useState<{ id: string; title: string; message: string } | null>(null)

  useEffect(() => {
    if (!reminders) return

    const interval = setInterval(() => {
      if (activeAlert) return // Only show one at a time

      const now = new Date()
      const triggered = JSON.parse(localStorage.getItem("Infinitodo_triggered_reminders") || "{}")

      for (const reminder of reminders) {
        const remindTime = new Date(reminder.remindAt)

        // Check if reminder is due (within last 24h) and hasn't been triggered
        if (now >= remindTime && now.getTime() - remindTime.getTime() < 86400000 && !triggered[reminder.id]) {
          triggered[reminder.id] = true
          localStorage.setItem("Infinitodo_triggered_reminders", JSON.stringify(triggered))

          sfx.panicAlert()
          setActiveAlert({
            id: reminder.id,
            title: reminder.title,
            message: "Reminder triggered!",
          })
          break
        }
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [reminders, activeAlert])

  return (
    <ReminderAlert
      open={!!activeAlert}
      title={activeAlert?.title || ""}
      message={activeAlert?.message || ""}
      onClose={() => setActiveAlert(null)}
    />
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation()
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [focusTime, setFocusTime] = useState(0)
  const [isFocusTimerRunning, setIsFocusTimerRunning] = useState(false)

  // Keyboard shortcut 'c' for AI Analyser
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'c' && e.target instanceof HTMLElement && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        setLocation('/ai-analyser');
        if (sfx.click) sfx.click();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setLocation]);

  useEffect(() => {
    let interval: any;
    if (isFocusMode && isFocusTimerRunning) {
      interval = setInterval(() => setFocusTime(p => p + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isFocusMode, isFocusTimerRunning]);

  useEffect(() => {
    if (!isFocusMode) {
      setIsFocusTimerRunning(false);
    }
  }, [isFocusMode]);

  const formatFocusTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/habits", label: "Habits", icon: Activity },
    { href: "/reminders", label: "Reminders", icon: Bell },
    { href: "/ai-analyser", label: "AI Analyser", icon: Brain },
    { href: "/timer", label: "Stopwatch", icon: Timer },
  ]

  const mobileNavItems = [
    ...navItems,
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="flex min-h-[100svh] flex-col md:flex-row bg-background selection:bg-primary/30 selection:text-primary-foreground relative overflow-hidden">
      {/* GLOBAL CINEMATIC ATMOSPHERE */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>

      {/* Mobile Top Nav (sticky) */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-border/50 glass-panel pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Infinitodo App Logo" className="w-8 h-8 object-contain rounded-lg shadow-sm" />
          <div className="flex flex-col">
            <div className="font-black text-xl text-foreground tracking-tighter leading-none uppercase">Infinitodo</div>
            <div className="text-[6px] font-black uppercase tracking-[0.1em] text-muted-foreground/80 mt-0.5">Unlock your disciplined era</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/landing"
            className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors",
              location === "/landing" || location === "/about"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:bg-accent"
            )}
            aria-label="Learn about Infinitodo"
          >
            <Sparkles className="w-4 h-4" />
            About
          </Link>
          <a
            href="https://t.me/babajishopingdeals"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Join our Telegram community"
          >
            <FaTelegram className="w-5 h-5" />
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* Sidebar (desktop / tablet landscape) */}
      <aside className={cn(
        "hidden md:flex w-64 flex-col bg-card h-[100vh] sticky top-0 shrink-0 border-r border-border transition-all duration-500 z-30",
        isFocusMode && "w-0 opacity-0 -translate-x-full border-none overflow-hidden m-0"
      )}>
        <div className="p-6 flex items-center gap-3">
          <PerspectiveCard depth={20}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 p-0.5 shadow-lg shadow-primary/20">
              <img src="/logo.png" alt="Infinitodo Brand Logo" className="w-full h-full object-contain rounded-[14px] bg-card" />
            </div>
          </PerspectiveCard>
          <div className="flex flex-col">
            <h2 className="text-2xl font-black tracking-tighter text-foreground leading-none uppercase">Infinitodo</h2>
            <p className="text-[6px] font-black uppercase tracking-[0.05em] text-muted-foreground/60 mt-1">Unlock your disciplined era</p>
          </div>
        </div>

        <div className="px-5 mb-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Operating System</div>
        </div>

        <nav className="flex-1 px-3 space-y-1 relative" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 outline-none",
                isActive
                  ? "text-primary font-bold bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50 font-medium"
              )}>
                <div className={cn("relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200", isActive ? "bg-primary/20 text-primary" : "bg-transparent text-muted-foreground group-hover:bg-accent group-hover:text-foreground")}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="truncate relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border/50 space-y-1">
          {(() => {
            const isAboutActive = location === "/landing" || location === "/about";
            return (
              <Link href="/landing" className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none",
                isAboutActive ? "text-primary font-bold bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-accent/50 font-medium"
              )}>
                <div className={cn("relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200", isAboutActive ? "bg-primary/20 text-primary" : "bg-transparent text-muted-foreground group-hover:bg-accent group-hover:text-foreground")}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="truncate relative z-10">About app</span>
              </Link>
            );
          })()}
          {(() => {
            const isSettingsActive = location === "/settings";
            return (
              <Link href="/settings" className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none",
                isSettingsActive ? "text-primary font-bold bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-accent/50 font-medium"
              )}>
                <div className={cn("relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200", isSettingsActive ? "bg-primary/20 text-primary" : "bg-transparent text-muted-foreground group-hover:bg-accent group-hover:text-foreground")}>
                  <Settings className="w-4 h-4" />
                </div>
                <span className="truncate relative z-10">Settings</span>
              </Link>
            );
          })()}

          <div className="pt-2">
            <InstallPWA />
          </div>

          <div className="px-3 py-4 mt-2 border-t border-border/50 bg-background/30 rounded-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Network</span>
              <div className="flex items-center gap-1">
                <a
                  href="https://t.me/babajishopingdeals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Telegram Community"
                >
                  <FaTelegram className="w-4 h-4" />
                </a>
                <ThemeToggle />
              </div>
            </div>

            {/* Professional Ad Placement */}
            <div className="relative group overflow-hidden rounded-xl border border-border/50">
              <div className="absolute inset-0 bg-primary/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex flex-col gap-1 p-1 bg-black/20">
                <div className="flex justify-center items-center overflow-hidden rounded-lg">
                  <div style={{ transform: 'scale(0.65)', transformOrigin: 'center', width: '320px', height: '50px', margin: '-10px 0' }}>
                    <ExternalAd type="mobile" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>


      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0 relative">
        {/* Focus Mode Overlay & Widget */}
        <AnimatePresence>
          {isFocusMode && (
            <>
              {/* Ambient Effects */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="pointer-events-none fixed inset-0 z-0 bg-background/60 backdrop-blur-xl"
              >
                <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] bg-emerald-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
              </motion.div>

              {/* Floating Focus Timer Widget */}
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-50 glass p-5 rounded-3xl border border-primary/20 shadow-[0_0_40px_hsl(var(--primary)/0.2)] flex items-center gap-5 bg-card/80 backdrop-blur-2xl"
              >
                <div className="flex flex-col min-w-[100px]">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1 flex items-center gap-1.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full", isFocusTimerRunning ? "bg-rose-500 animate-pulse" : "bg-muted")} />
                    Deep Work
                  </span>
                  <span className="text-4xl font-black tabular-nums tracking-tighter text-foreground">{formatFocusTime(focusTime)}</span>
                </div>
                <div className="flex items-center gap-2 border-l border-border/50 pl-5">
                  <Button
                    size="icon"
                    variant={isFocusTimerRunning ? "default" : "secondary"}
                    className={cn("h-14 w-14 rounded-full shadow-lg transition-all", isFocusTimerRunning ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/30" : "bg-card hover:bg-primary hover:text-primary-foreground")}
                    onClick={() => {
                      setIsFocusTimerRunning(!isFocusTimerRunning);
                      if (sfx.click) sfx.click();
                    }}
                  >
                    {isFocusTimerRunning ? <PauseCircle className="w-7 h-7" /> : <PlayCircle className="w-7 h-7" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    onClick={() => {
                      setFocusTime(0);
                      setIsFocusTimerRunning(false);
                      if (sfx.pop) sfx.pop();
                    }}
                    title="Reset Focus Session"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>

              {/* Exit Button */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => {
                  setIsFocusMode(false);
                  if (sfx.click) sfx.click();
                }}
                className="fixed left-4 top-4 z-50 p-3 rounded-full bg-card/80 backdrop-blur border border-primary/20 text-foreground shadow-lg hover:bg-primary hover:text-primary-foreground transition-all group"
                title="Exit Focus Mode"
              >
                <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </motion.button>
            </>
          )}
        </AnimatePresence>

        <main className={cn(
          "flex-1 min-w-0 px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 mx-auto w-full pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8 transition-all duration-500",
          isFocusMode ? "max-w-4xl" : "max-w-5xl"
        )}>
          <div className="flex justify-end mb-6 hidden md:flex">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFocusMode(!isFocusMode)}
              className="h-9 rounded-full px-4 text-xs font-bold gap-2 text-muted-foreground hover:text-white hover:bg-primary/20 hover:border-primary/50 transition-all shadow-sm glass"
            >
              {isFocusMode ? <PlayCircle className="w-4 h-4 text-primary" /> : <PauseCircle className="w-4 h-4" />}
              {isFocusMode ? "Exit Focus" : "Focus Mode"}
            </Button>
          </div>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav (fixed) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 glass-panel pb-[env(safe-area-inset-bottom)]"
        aria-label="Primary"
      >
        <div className="flex justify-around items-stretch px-2 py-2">
          {mobileNavItems.map((item) => {
            const isActive = location === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl min-w-0 transition-all",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 relative z-10 transition-transform", isActive && "scale-110 text-primary")} />
                <span className="text-[9px] leading-tight font-bold tracking-wide uppercase truncate max-w-full relative z-10">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Global Reminder Listener */}
      <GlobalReminder />
    </div>
  )
}
