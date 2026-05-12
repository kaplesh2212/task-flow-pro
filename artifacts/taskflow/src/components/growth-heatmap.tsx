import { motion } from "framer-motion";
import { format, subDays, startOfToday, isSameDay } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HeatmapData {
  date: Date;
  count: number;
}

export function GrowthHeatmap({ data, title }: { data: HeatmapData[], title?: string }) {
  // Generate last 84 days (12 weeks)
  const today = startOfToday();
  const days = Array.from({ length: 84 }).map((_, i) => subDays(today, 83 - i));

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-muted/30";
    if (count <= 2) return "bg-primary/30";
    if (count <= 5) return "bg-primary/60";
    return "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]";
  };

  return (
    <div className="space-y-3">
      {title && <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">{title}</h3>}
      <div className="grid grid-flow-col grid-rows-7 gap-1.5 p-4 rounded-2xl bg-card/40 border border-border/50 overflow-x-auto custom-scrollbar">
        <TooltipProvider delayDuration={100}>
          {days.map((day, i) => {
            const dayData = data.find((d) => isSameDay(d.date, day));
            const count = dayData?.count || 0;
            
            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.005 }}
                    className={cn(
                      "w-3 h-3 sm:w-4 sm:h-4 rounded-[2px] transition-all hover:ring-2 hover:ring-primary/50 cursor-pointer",
                      getIntensity(count)
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px] font-bold">
                  {count} activities on {format(day, "MMM d, yyyy")}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
      <div className="flex items-center justify-between px-1 text-[10px] text-muted-foreground font-medium">
        <span>84 days ago</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-[1px] bg-muted/30" />
          <div className="w-2.5 h-2.5 rounded-[1px] bg-primary/30" />
          <div className="w-2.5 h-2.5 rounded-[1px] bg-primary/60" />
          <div className="w-2.5 h-2.5 rounded-[1px] bg-primary" />
          <span>More</span>
        </div>
        <span>Today</span>
      </div>
    </div>
  );
}
