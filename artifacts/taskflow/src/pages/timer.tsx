import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Flag,
  Share2,
  Trash2,
  Timer as TimerIcon,
  Zap,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { soundscapes, SoundscapeType } from "@/lib/soundscapes";
import { Music, Volume2, VolumeX } from "lucide-react";

interface Lap {
  id: string;
  lapNumber: number;
  lapTime: number;
  totalTime: number;
}

function formatTime(ms: number) {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const s = Math.floor(totalCs / 100) % 60;
  const m = Math.floor(totalCs / 6000) % 60;
  const h = Math.floor(totalCs / 360000);
  return { h, m, s, cs };
}

function pad(n: number, digits = 2) {
  return n.toString().padStart(digits, "0");
}

function formatDisplay(ms: number, showHours = false) {
  const { h, m, s, cs } = formatTime(ms);
  if (showHours || h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
  }
  return `${pad(m)}:${pad(s)}.${pad(cs)}`;
}

function formatLapDisplay(ms: number) {
  const { h, m, s, cs } = formatTime(ms);
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
  return `${pad(m)}:${pad(s)}.${pad(cs)}`;
}

function HourglassLoader() {
  return (
    <svg
      aria-label="loader being flipped clockwise and circled by three white curves fading in and out"
      role="img"
      height="48px"
      width="48px"
      viewBox="0 0 56 56"
      className="loader"
    >
      <clipPath id="sand-mound-top">
        <path
          d="M 14.613 13.087 C 15.814 12.059 19.3 8.039 20.3 6.539 C 21.5 4.789 21.5 2.039 21.5 2.039 L 3 2.039 C 3 2.039 3 4.789 4.2 6.539 C 5.2 8.039 8.686 12.059 9.887 13.087 C 11 14.039 12.25 14.039 12.25 14.039 C 12.25 14.039 13.5 14.039 14.613 13.087 Z"
          className="loader__sand-mound-top"
        ></path>
      </clipPath>
      <clipPath id="sand-mound-bottom">
        <path
          d="M 14.613 20.452 C 15.814 21.48 19.3 25.5 20.3 27 C 21.5 28.75 21.5 31.5 21.5 31.5 L 3 31.5 C 3 31.5 3 28.75 4.2 27 C 5.2 25.5 8.686 21.48 9.887 20.452 C 11 19.5 12.25 19.5 12.25 19.5 C 12.25 19.5 13.5 19.5 14.613 20.452 Z"
          className="loader__sand-mound-bottom"
        ></path>
      </clipPath>
      <g transform="translate(2,2)">
        <g
          transform="rotate(-90,26,26)"
          stroke-linecap="round"
          stroke-dashoffset="153.94"
          stroke-dasharray="153.94 153.94"
          stroke="hsl(0,0%,100%)"
          fill="none"
        >
          <circle
            transform="rotate(0,26,26)"
            r="24.5"
            cy="26"
            cx="26"
            stroke-width="2.5"
            className="loader__motion-thick"
          ></circle>
          <circle
            transform="rotate(90,26,26)"
            r="24.5"
            cy="26"
            cx="26"
            stroke-width="1.75"
            className="loader__motion-medium"
          ></circle>
          <circle
            transform="rotate(180,26,26)"
            r="24.5"
            cy="26"
            cx="26"
            stroke-width="1"
            className="loader__motion-thin"
          ></circle>
        </g>
        <g transform="translate(13.75,9.25)" className="loader__model">
          <path
            d="M 1.5 2 L 23 2 C 23 2 22.5 8.5 19 12 C 16 15.5 13.5 13.5 13.5 16.75 C 13.5 20 16 18 19 21.5 C 22.5 25 23 31.5 23 31.5 L 1.5 31.5 C 1.5 31.5 2 25 5.5 21.5 C 8.5 18 11 20 11 16.75 C 11 13.5 8.5 15.5 5.5 12 C 2 8.5 1.5 2 1.5 2 Z"
            fill="hsl(var(--hue),90%,85%)"
          ></path>

          <g stroke-linecap="round" stroke="hsl(35,90%,90%)">
            <line
              y2="20.75"
              x2="12"
              y1="15.75"
              x1="12"
              stroke-dasharray="0.25 33.75"
              stroke-width="1"
              className="loader__sand-grain-left"
            ></line>
            <line
              y2="21.75"
              x2="12.5"
              y1="16.75"
              x1="12.5"
              stroke-dasharray="0.25 33.75"
              stroke-width="1"
              className="loader__sand-grain-right"
            ></line>
            <line
              y2="31.5"
              x2="12.25"
              y1="18"
              x1="12.25"
              stroke-dasharray="0.5 107.5"
              stroke-width="1"
              className="loader__sand-drop"
            ></line>
            <line
              y2="31.5"
              x2="12.25"
              y1="14.75"
              x1="12.25"
              stroke-dasharray="54 54"
              stroke-width="1.5"
              className="loader__sand-fill"
            ></line>
            <line
              y2="31.5"
              x2="12"
              y1="16"
              x1="12"
              stroke-dasharray="1 107"
              stroke-width="1"
              stroke="hsl(35,90%,83%)"
              className="loader__sand-line-left"
            ></line>
            <line
              y2="31.5"
              x2="12.5"
              y1="16"
              x1="12.5"
              stroke-dasharray="12 96"
              stroke-width="1"
              stroke="hsl(35,90%,83%)"
              className="loader__sand-line-right"
            ></line>

            <g stroke-width="0" fill="hsl(35,90%,90%)">
              <path
                d="M 12.25 15 L 15.392 13.486 C 21.737 11.168 22.5 2 22.5 2 L 2 2.013 C 2 2.013 2.753 11.046 9.009 13.438 L 12.25 15 Z"
                clipPath="url(#sand-mound-top)"
              ></path>
              <path
                d="M 12.25 18.5 L 15.392 20.014 C 21.737 22.332 22.5 31.5 22.5 31.5 L 2 31.487 C 2 31.487 2.753 22.454 9.009 20.062 Z"
                clipPath="url(#sand-mound-bottom)"
              ></path>
            </g>
          </g>

          <g stroke-width="2" stroke-linecap="round" opacity="0.7" fill="none">
            <path
              d="M 19.437 3.421 C 19.437 3.421 19.671 6.454 17.914 8.846 C 16.157 11.238 14.5 11.5 14.5 11.5"
              stroke="hsl(0,0%,100%)"
              className="loader__glare-top"
            ></path>
            <path
              transform="rotate(180,12.25,16.75)"
              d="M 19.437 3.421 C 19.437 3.421 19.671 6.454 17.914 8.846 C 16.157 11.238 14.5 11.5 14.5 11.5"
              stroke="hsla(0,0%,100%,0)"
              className="loader__glare-bottom"
            ></path>
          </g>

          <rect height="2" width="24.5" fill="hsl(var(--hue),90%,50%)"></rect>
          <rect
            height="1"
            width="19.5"
            y="0.5"
            x="2.5"
            ry="0.5"
            rx="0.5"
            fill="hsl(var(--hue),90%,57.5%)"
          ></rect>
          <rect
            height="2"
            width="24.5"
            y="31.5"
            fill="hsl(var(--hue),90%,50%)"
          ></rect>
          <rect
            height="1"
            width="19.5"
            y="32"
            x="2.5"
            ry="0.5"
            rx="0.5"
            fill="hsl(var(--hue),90%,57.5%)"
          ></rect>
        </g>
      </g>
    </svg>
  );
}

export default function Timer() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [sessionCount, setSessionCount] = useState(0);

  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const lastLapTimeRef = useRef<number>(0);
  const [soundscape, setSoundscape] = useState<SoundscapeType>("none");

  useEffect(() => {
    soundscapes.play(soundscape);
    return () => soundscapes.stop();
  }, [soundscape]);

  const tick = useCallback(() => {
    const now = performance.now();
    setElapsed(accumulatedRef.current + (now - startTimeRef.current));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      accumulatedRef.current = elapsed;
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const handleStartPause = () => {
    if (!isRunning && elapsed === 0) {
      setSessionCount((c) => c + 1);
    }
    setIsRunning((r) => !r);
  };

  const handleReset = () => {
    setIsRunning(false);
    accumulatedRef.current = 0;
    lastLapTimeRef.current = 0;
    setElapsed(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (!isRunning || elapsed === 0) return;
    const lapTime = elapsed - lastLapTimeRef.current;
    const lapNumber = laps.length + 1;
    setLaps((prev) => [
      { id: Date.now().toString(), lapNumber, lapTime, totalTime: elapsed },
      ...prev,
    ]);
    lastLapTimeRef.current = elapsed;
  };

  const handleShare = async () => {
    if (laps.length === 0 && elapsed === 0) return;
    const lines = [
      `⏱ Infinitodo Stopwatch Session`,
      `Total Time: ${formatDisplay(elapsed, true)}`,
      `Laps: ${laps.length}`,
      "",
      ...laps
        .slice()
        .reverse()
        .map(
          (l) =>
            `Lap ${pad(l.lapNumber)}  ${formatLapDisplay(l.lapTime)}  (Total: ${formatLapDisplay(l.totalTime)})`
        ),
    ];
    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Session copied to clipboard!");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  const showHours = elapsed >= 3_600_000;
  const { h, m, s, cs } = formatTime(elapsed);

  // Animated arc: one rotation per minute
  const secondProgress = (s + cs / 100) / 60;
  const minuteProgress = ((m % 60) + secondProgress / 60) / 60;

  const SIZE = 300;
  const STROKE = 14;
  const R_OUTER = SIZE / 2 - STROKE / 2;
  const R_INNER = R_OUTER - STROKE - 6;
  const C_OUTER = 2 * Math.PI * R_OUTER;
  const C_INNER = 2 * Math.PI * R_INNER;

  const outerOffset = C_OUTER - secondProgress * C_OUTER;
  const innerOffset = C_INNER - minuteProgress * C_INNER;

  // Lap analysis
  const lapDiffs = laps.map((l) => l.lapTime);
  const minDiff = lapDiffs.length > 0 ? Math.min(...lapDiffs) : -1;
  const maxDiff = lapDiffs.length > 0 ? Math.max(...lapDiffs) : -1;
  const fastestId = laps.length > 2 ? laps.find((l) => l.lapTime === minDiff)?.id : null;
  const slowestId = laps.length > 2 ? laps.find((l) => l.lapTime === maxDiff)?.id : null;

  return (
    <div className={cn(
      "min-h-screen flex flex-col items-center justify-start py-6 px-4 transition-all duration-1000",
      isRunning ? "animated-gradient" : "bg-background"
    )}>
      <div className="max-w-2xl mx-auto w-full">
        {/* ── Header ── */}
        <motion.div
          className="w-full flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <TimerIcon className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Stopwatch
              </h1>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5 ml-1">
              {sessionCount > 0
                ? `Session #${sessionCount} • ${laps.length} lap${laps.length !== 1 ? "s" : ""}`
                : "Track every second with precision"}
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border shadow-sm">
              <Music className="h-3.5 w-3.5 text-primary" />
              <select
                value={soundscape}
                onChange={(e) => setSoundscape(e.target.value as SoundscapeType)}
                className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="none">Silence</option>
                <option value="white">White Noise</option>
                <option value="pink">Pink Noise</option>
                <option value="brown">Deep Brown</option>
                <option value="rain">Soft Rain</option>
                <option value="waves">Ocean Waves</option>
              </select>
            </div>
            {(elapsed > 0 || laps.length > 0) && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-xl text-xs h-8"
                  onClick={handleShare}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── Clock Face ── */}
        <motion.div
          className="relative flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
        >
          {/* Ambient glow behind the clock */}
          <AnimatePresence>
            {isRunning && (
              <motion.div
                key="glow"
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: SIZE + 60,
                  height: SIZE + 60,
                  top: -30,
                  left: -30,
                  background:
                    "radial-gradient(ellipse, hsl(var(--primary)/0.25) 0%, transparent 70%)",
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: [1, 1.08, 1] }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 2.5, repeat: Infinity, repeatType: "mirror" }}
              />
            )}
          </AnimatePresence>

          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="-rotate-90"
          >
            <defs>
              <linearGradient id="sw-grad-sec" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--ring))" />
              </linearGradient>
              <linearGradient id="sw-grad-min" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary)/0.5)" />
                <stop offset="100%" stopColor="hsl(var(--ring)/0.5)" />
              </linearGradient>
              <filter id="sw-glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Outer track (seconds) */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R_OUTER}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={STROKE}
              opacity={0.18}
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R_OUTER}
              fill="none"
              stroke="url(#sw-grad-sec)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={C_OUTER}
              strokeDashoffset={outerOffset}
              filter="url(#sw-glow)"
              style={{ transition: "stroke-dashoffset 0.08s linear" }}
            />

            {/* Inner track (minutes) */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R_INNER}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={STROKE * 0.6}
              opacity={0.12}
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R_INNER}
              fill="none"
              stroke="url(#sw-grad-min)"
              strokeWidth={STROKE * 0.6}
              strokeLinecap="round"
              strokeDasharray={C_INNER}
              strokeDashoffset={innerOffset}
              style={{ transition: "stroke-dashoffset 0.5s linear" }}
            />

            {/* Tick marks */}
            {Array.from({ length: 60 }).map((_, i) => {
              const angle = (i / 60) * 360;
              const rad = (angle * Math.PI) / 180;
              const isMajor = i % 5 === 0;
              const len = isMajor ? 10 : 5;
              const r1 = R_OUTER - STROKE / 2 - 4;
              const r2 = r1 - len;
              const cx2 = SIZE / 2 + Math.cos(rad) * r2;
              const cy2 = SIZE / 2 + Math.sin(rad) * r2;
              const cx1 = SIZE / 2 + Math.cos(rad) * r1;
              const cy1 = SIZE / 2 + Math.sin(rad) * r1;
              return (
                <line
                  key={i}
                  x1={cx1}
                  y1={cy1}
                  x2={cx2}
                  y2={cy2}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={isMajor ? 2 : 1}
                  opacity={isMajor ? 0.3 : 0.12}
                />
              );
            })}
          </svg>

          {/* Digital display — centered over SVG */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center select-none"
            style={{ pointerEvents: "none" }}
          >
            {showHours && (
              <div className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-1">
                {pad(h)}h
              </div>
            )}
            <div className="flex items-baseline gap-0.5 font-black tabular-nums">
              <motion.span
                key={m}
                initial={{ y: -8, opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-5xl sm:text-6xl tracking-tighter bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent"
              >
                {pad(m)}
              </motion.span>
              <span className="text-4xl sm:text-5xl text-foreground/30 mb-1">:</span>
              <motion.span
                key={s}
                initial={{ y: -6, opacity: 0.6 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-5xl sm:text-6xl tracking-tighter bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent"
              >
                {pad(s)}
              </motion.span>
              <span className="text-foreground/20 text-3xl mb-0.5 mx-0.5">.</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-primary">
                {pad(cs)}
              </span>
            </div>
            <div
              className={`mt-2 text-[11px] font-semibold uppercase tracking-widest transition-colors ${isRunning ? "text-emerald-500" : elapsed > 0 ? "text-amber-500" : "text-muted-foreground/50"
                }`}
            >
              {isRunning ? "● Running" : elapsed > 0 ? "⏸ Paused" : "Ready"}
            </div>

            {/* ── Hourglass Animation ── */}
            <div className="h-16 flex items-center justify-center mt-4">
              <AnimatePresence>
                {isRunning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: -10 }}
                  >
                    <HourglassLoader />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ── Controls ── */}
        <motion.div
          className="flex items-center gap-5 mt-8 mb-6 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Reset */}
          <motion.button
            whileHover={{ scale: elapsed > 0 ? 1.08 : 1 }}
            whileTap={{ scale: elapsed > 0 ? 0.94 : 1 }}
            onClick={handleReset}
            disabled={elapsed === 0}
            className="h-14 w-14 rounded-full border-2 border-border flex items-center justify-center bg-card shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary/40 hover:bg-muted"
            aria-label="Reset"
          >
            <Trash2 className="h-5 w-5 text-muted-foreground" />
          </motion.button>

          {/* Play / Pause — big CTA */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleStartPause}
            className={`h-24 w-24 rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden transition-all duration-300 ${isRunning
              ? "bg-rose-500 shadow-rose-500/40 hover:bg-rose-600"
              : "bg-primary shadow-primary/40 hover:bg-primary/90"
              }`}
            aria-label={isRunning ? "Pause" : "Start"}
          >
            {/* Ripple ring */}
            <AnimatePresence>
              {isRunning && (
                <motion.div
                  key="ring"
                  className="absolute inset-0 rounded-full border-4 border-primary/30"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                />
              )}
            </AnimatePresence>
            <motion.div
              initial={false}
              animate={{ rotate: isRunning ? 0 : 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {isRunning ? (
                <Pause className="h-9 w-9 text-white fill-white" />
              ) : (
                <Play className="h-9 w-9 text-white fill-white ml-1" />
              )}
            </motion.div>
          </motion.button>

          {/* Lap */}
          <motion.button
            whileHover={{ scale: isRunning ? 1.08 : 1 }}
            whileTap={{ scale: isRunning ? 0.94 : 1 }}
            onClick={handleLap}
            disabled={!isRunning}
            className="h-14 w-14 rounded-full border-2 border-border flex items-center justify-center bg-card shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary/40 hover:bg-muted"
            aria-label="Lap"
          >
            <Flag className="h-5 w-5 text-muted-foreground" />
          </motion.button>
        </motion.div>

        {/* Keyboard hint */}
        <p className="text-[11px] text-muted-foreground/50 mb-6 text-center">
          Space to start/pause • L to lap • R to reset
        </p>

        {/* ── Lap Table ── */}
        <AnimatePresence>
          {laps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="w-full"
            >
              {/* Summary bar */}
              {laps.length > 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 mb-4"
                >
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600">
                    <Zap className="h-3.5 w-3.5" />
                    Best {formatLapDisplay(minDiff)}
                  </div>
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-500">
                    <TrendingDown className="h-3.5 w-3.5" />
                    Worst {formatLapDisplay(maxDiff)}
                  </div>
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Avg {formatLapDisplay(lapDiffs.reduce((a, b) => a + b, 0) / lapDiffs.length)}
                  </div>
                </motion.div>
              )}

              {/* Header row */}
              <div className="flex items-center px-4 mb-2 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                <span className="w-10">#</span>
                <span className="flex-1">Lap Time</span>
                <span className="w-32 text-right">Total</span>
                <span className="w-6" />
              </div>

              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {laps.map((lap, idx) => {
                    const isFastest = lap.id === fastestId;
                    const isSlowest = lap.id === slowestId;
                    const isCurrent = idx === 0;
                    return (
                      <motion.div
                        key={lap.id}
                        layout
                        initial={{ opacity: 0, x: -20, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: "auto" }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        className={`flex items-center px-4 py-3.5 rounded-2xl border backdrop-blur-sm text-sm font-medium relative overflow-hidden ${isCurrent
                          ? "bg-card border-primary/30"
                          : isFastest
                            ? "bg-emerald-500/5 border-emerald-500/25 text-emerald-600"
                            : isSlowest
                              ? "bg-rose-500/5 border-rose-500/25 text-rose-500"
                              : "bg-card/60 border-border/40"
                          }`}
                      >
                        {/* Accent stripe */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${isCurrent
                            ? "bg-primary"
                            : isFastest
                              ? "bg-emerald-500"
                              : isSlowest
                                ? "bg-rose-500"
                                : "bg-transparent"
                            }`}
                        />

                        <span className="w-10 font-bold tabular-nums pl-2">
                          {pad(lap.lapNumber)}
                        </span>

                        <span className="flex-1 tabular-nums font-semibold">
                          {formatLapDisplay(lap.lapTime)}
                        </span>

                        <span className="w-32 text-right tabular-nums text-muted-foreground text-xs">
                          {formatLapDisplay(lap.totalTime)}
                        </span>

                        <span className="w-6 text-right">
                          {isFastest && <Zap className="h-3.5 w-3.5 text-emerald-500 inline" />}
                          {isSlowest && <TrendingDown className="h-3.5 w-3.5 text-rose-500 inline" />}
                          {isCurrent && !isFastest && !isSlowest && (
                            <span className="text-[9px] text-primary font-bold">NOW</span>
                          )}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Keyboard Shortcuts Handler ── */}
        <KeyboardHandler
          onStartPause={handleStartPause}
          onLap={handleLap}
          onReset={handleReset}
          isRunning={isRunning}
          elapsed={elapsed}
        />
      </div>
    </div>
  );
}

function KeyboardHandler({
  onStartPause,
  onLap,
  onReset,
  isRunning,
  elapsed,
}: {
  onStartPause: () => void;
  onLap: () => void;
  onReset: () => void;
  isRunning: boolean;
  elapsed: number;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        onStartPause();
      } else if (e.code === "KeyL" && isRunning) {
        e.preventDefault();
        onLap();
      } else if (e.code === "KeyR" && elapsed > 0) {
        e.preventDefault();
        onReset();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onStartPause, onLap, onReset, isRunning, elapsed]);

  return null;
}
