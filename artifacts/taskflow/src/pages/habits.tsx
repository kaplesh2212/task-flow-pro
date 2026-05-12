import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListHabits,
  useCreateHabit,
  useUpdateHabit,
  useDeleteHabit,
  useCheckInHabit,
  useGetHabit,
  getListHabitsQueryKey,
  getGetHabitQueryKey,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Flame,
  Trophy,
  MoreVertical,
  Trash2,
  Edit,
  Activity,
  Check,
  Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { sfx } from "@/lib/sfx";
import { celebrate, streakCelebrate } from "@/lib/celebrate";
import { ExternalAd } from "@/components/external-ad";

const habitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  icon: z.string().min(1, "Icon string is required"),
  color: z.string().min(1, "Color is required"),
  frequency: z.enum(["daily", "weekly"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

type HabitFormValues = z.infer<typeof habitSchema>;

export default function Habits() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const { data: habits, isLoading } = useListHabits({
    query: { queryKey: getListHabitsQueryKey() }
  });

  const { data: habitDetail } = useGetHabit(selectedHabitId || "", {
    query: {
      enabled: !!selectedHabitId,
      queryKey: getGetHabitQueryKey(selectedHabitId || "")
    }
  });

  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();
  const checkInHabit = useCheckInHabit();

  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "A",
      color: "#1db4a7", // Matches our primary hue roughly
      frequency: "daily",
      difficulty: "medium",
    },
  });

  const onSubmit = (data: HabitFormValues) => {
    if (editingId) {
      updateHabit.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListHabitsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
            toast.success("Habit updated");
            setIsDialogOpen(false);
          },
          onError: (err: any) => {
            console.error("Update habit error:", err);
            toast.error(err.message || "Failed to update habit");
          }
        }
      );
    } else {
      createHabit.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListHabitsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
            toast.success("Habit created");
            setIsDialogOpen(false);
          },
          onError: (err: any) => {
            console.error("Create habit error:", err);
            toast.error(err.message || "Failed to create habit");
          }
        }
      );
    }
  };

  const handleCheckIn = (e: React.MouseEvent, id: string, completedToday: boolean, currentStreak: number) => {
    e.stopPropagation(); // Prevent opening detail sheet
    if (completedToday) return; // Already completed

    checkInHabit.mutate(
      { id },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListHabitsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          sfx.habitCheckIn();
          const newStreak = (data as any)?.streak ?? currentStreak + 1;
          // Big celebration for milestone streaks
          if (newStreak > 0 && (newStreak % 7 === 0 || newStreak === 1)) {
            streakCelebrate();
          } else {
            celebrate();
          }
          toast.success(`Congratulations! Habit completed! ${newStreak}-day streak`, {
            icon: <Flame className="h-4 w-4 text-orange-500" />,
          });
        },
        onError: (err: any) => {
          console.error("Check-in habit error:", err);
          toast.error(err.message || "Failed to check in");
        }
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteHabit.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListHabitsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast.success("Habit deleted");
          sfx.delete();
          if (selectedHabitId === id) setSelectedHabitId(null);
        },
        onError: (err: any) => {
          console.error("Delete habit error:", err);
          toast.error(err.message || "Failed to delete habit");
        }
      }
    );
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({
      name: "", description: "", icon: "A", color: "#1db4a7", frequency: "daily", difficulty: "medium"
    });
    setIsDialogOpen(true);
  };

  const openEdit = (e: React.MouseEvent, habit: any) => {
    e.stopPropagation();
    setEditingId(habit.id);
    form.reset({
      name: habit.name,
      description: habit.description || "",
      icon: habit.icon,
      color: habit.color,
      frequency: habit.frequency,
      difficulty: habit.difficulty,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
        <div className="relative flex flex-col gap-6 glass p-6 rounded-2xl border-primary/10 shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">Habits</h1>
              <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">Build consistency and maintain your streaks.</p>
            </div>
            <Button onClick={openCreate} size="lg" className="shadow-glow hover:scale-105 transition-all shrink-0 font-bold px-8">
              <Plus className="h-5 w-5 mr-2" />
              New Habit
            </Button>
          </div>

          {/* Professional Advertisement Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-1">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Sponsored Resource</span>
            </div>
            <div className="w-full flex justify-center bg-background/30 rounded-xl p-2 border border-border/50 overflow-x-auto custom-scrollbar">
              <ExternalAd type="leaderboard" />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : !Array.isArray(habits) || habits.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-card border-dashed">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No habits yet</h3>
          <p className="text-muted-foreground mt-1 mb-6">Start building better routines today.</p>
          <Button onClick={openCreate} variant="outline">Create a habit</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {habits?.map((habit, i) => (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedHabitId(habit.id)}
                className={`p-5 rounded-2xl border bg-card cursor-pointer transition-all hover:shadow-md hover:border-primary/30 flex flex-col justify-between group ${habit.completedToday ? 'border-primary/50 bg-primary/5' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0"
                      style={{ backgroundColor: habit.color }}
                    >
                      {habit.icon?.charAt(0).toUpperCase() || 'H'}
                    </div>
                    <div>
                      <h3 className="font-semibold leading-none">{habit.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">{habit.frequency} • {habit.difficulty}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => openEdit(e, habit)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(habit.id); }} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-end justify-between mt-auto">
                  <div className="flex items-center gap-1.5 text-orange-500 font-medium">
                    <Flame className={`h-5 w-5 ${habit.streak > 0 ? 'fill-orange-500' : ''}`} />
                    <span>{habit.streak} streak</span>
                  </div>

                  <Button
                    onClick={(e) => handleCheckIn(e, habit.id, habit.completedToday, habit.streak)}
                    variant={habit.completedToday ? "default" : "outline"}
                    className={`rounded-full px-6 h-9 transition-all ${habit.completedToday ? "bg-primary text-primary-foreground hover:bg-primary" : "hover:bg-primary/10 hover:text-primary hover:border-primary"}`}
                    disabled={habit.completedToday || checkInHabit.isPending}
                  >
                    {habit.completedToday ? (
                      <><Check className="h-4 w-4 mr-1.5" /> Completed</>
                    ) : "Done"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Habit Details Sheet */}
      <Sheet open={!!selectedHabitId} onOpenChange={(open) => !open && setSelectedHabitId(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Habit Details</SheetTitle>
            <SheetDescription>View your progress and history.</SheetDescription>
          </SheetHeader>

          {habitDetail ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md shrink-0"
                  style={{ backgroundColor: habitDetail.color }}
                >
                  {habitDetail.icon?.charAt(0).toUpperCase() || 'H'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{habitDetail.name}</h2>
                  {habitDetail.description && <p className="text-muted-foreground">{habitDetail.description}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <Flame className="h-6 w-6 text-orange-500 mb-2 fill-orange-500" />
                  <div className="text-2xl font-bold">{habitDetail.streak}</div>
                  <div className="text-xs text-muted-foreground">Current Streak</div>
                </div>
                <div className="bg-card border rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <Trophy className="h-6 w-6 text-yellow-500 mb-2 fill-yellow-500" />
                  <div className="text-2xl font-bold">{habitDetail.bestStreak}</div>
                  <div className="text-xs text-muted-foreground">Best Streak</div>
                </div>
              </div>

              <div className="border rounded-xl p-4 bg-card">
                <h4 className="font-medium mb-4 text-sm">Completion Rate</h4>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className="w-20 h-20 transform -rotate-90">
                      <path
                        className="text-muted stroke-current"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" strokeWidth="3"
                      />
                      <path
                        className="text-primary stroke-current"
                        strokeDasharray={`${habitDetail.completionRate}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" strokeWidth="3" strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute text-lg font-bold">{habitDetail.completionRate}%</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      You've maintained a {habitDetail.completionRate}% completion rate for this habit. Keep it up!
                    </p>
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-4 bg-card">
                <h4 className="font-medium mb-4 text-sm">Recent Activity</h4>
                <div className="flex gap-2">
                  {habitDetail.recentLogs?.slice(0, 14).reverse().map((log, i) => (
                    <div
                      key={i}
                      title={new Date(log.date).toLocaleDateString()}
                      className={`w-5 h-5 rounded-sm ${log.completed ? 'opacity-100' : 'opacity-20 bg-muted-foreground/30'}`}
                      style={{ backgroundColor: log.completed ? habitDetail.color : undefined }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <Skeleton className="h-40 w-full" />
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Habit" : "New Habit"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Read for 30 minutes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Why are you building this habit?" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Letter/Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="R" maxLength={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color Hex</FormLabel>
                      <FormControl>
                        <Input type="color" className="h-10 px-2 py-1 cursor-pointer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createHabit.isPending || updateHabit.isPending}>
                  {editingId ? "Save Changes" : "Create Habit"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
