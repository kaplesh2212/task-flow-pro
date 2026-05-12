import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListReminders,
  useCreateReminder,
  useUpdateReminder,
  useDeleteReminder,
  useListTasks,
  useListHabits,
  getListRemindersQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  MoreVertical,
  Bell,
  Trash2,
  Edit,
  Clock,
  Repeat,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import { ReminderAlert } from "@/components/reminder-alert";
import { sfx } from "@/lib/sfx";
import { celebrate } from "@/lib/celebrate";
import { ExternalAd } from "@/components/external-ad";

const reminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  remindAt: z.string().min(1, "Date/Time is required"),
  repeat: z.enum(["none", "daily", "weekly"]),
  linkedTaskId: z.string().optional().nullable(),
  linkedHabitId: z.string().optional().nullable(),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

export default function Reminders() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<{
    open: boolean;
    title: string;
    message?: string;
  }>({ open: false, title: "" });

  const { data: reminders, isLoading } = useListReminders({
    query: { queryKey: getListRemindersQueryKey() },
  });

  const { data: tasks } = useListTasks();
  const { data: habits } = useListHabits();

  const createReminder = useCreateReminder();
  const updateReminder = useUpdateReminder();
  const deleteReminder = useDeleteReminder();

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: "",
      remindAt: "",
      repeat: "none",
      linkedTaskId: null,
      linkedHabitId: null,
    },
  });

  const onSubmit = (data: ReminderFormValues) => {
    const payload = {
      ...data,
      remindAt: new Date(data.remindAt).toISOString(),
    };
    const remindDate = new Date(data.remindAt);
    const friendlyTime = format(remindDate, "MMM d, h:mm a");

    if (editingId) {
      updateReminder.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListRemindersQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
            toast.success("Reminder updated");
            sfx.pop();
            setIsDialogOpen(false);
          },
        },
      );
    } else {
      createReminder.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListRemindersQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
            setIsDialogOpen(false);
            // Trigger dramatic full-window alert + sound + confetti
            sfx.reminderAlert();
            celebrate();
            setAlertState({
              open: true,
              title: data.title,
              message: `Scheduled for ${friendlyTime}${data.repeat !== "none" ? ` • repeats ${data.repeat}` : ""}`,
            });
          },
        },
      );
    }
  };

  const handleDelete = (id: string) => {
    deleteReminder.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListRemindersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast.success("Reminder deleted");
          sfx.delete();
        },
      },
    );
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({
      title: "",
      remindAt: "",
      repeat: "none",
      linkedTaskId: null,
      linkedHabitId: null,
    });
    setIsDialogOpen(true);
    sfx.click();
  };

  const openEdit = (reminder: any) => {
    setEditingId(reminder.id);
    const dateObj = new Date(reminder.remindAt);
    const tzOffset = dateObj.getTimezoneOffset() * 60000;
    const localISOTime = new Date(dateObj.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16);

    form.reset({
      title: reminder.title,
      remindAt: localISOTime,
      repeat: reminder.repeat,
      linkedTaskId: reminder.linkedTaskId || null,
      linkedHabitId: reminder.linkedHabitId || null,
    });
    setIsDialogOpen(true);
  };

  // Demo: let user re-trigger the alert popup for any saved reminder
  const previewAlert = (reminder: any) => {
    sfx.reminderAlert();
    setAlertState({
      open: true,
      title: reminder.title,
      message: `Scheduled for ${format(new Date(reminder.remindAt), "MMM d, h:mm a")}${
        reminder.repeat !== "none" ? ` • repeats ${reminder.repeat}` : ""
      }`,
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
          <div className="relative flex flex-col gap-6 glass p-6 rounded-2xl border-primary/10 shadow-xl overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">Reminders</h1>
                <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">Smart alerts for what matters most.</p>
              </div>
              <Button onClick={openCreate} size="lg" className="shadow-glow hover:scale-105 transition-all shrink-0 font-bold px-8">
                <Plus className="h-5 w-5 mr-2" />
                New Reminder
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
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : reminders?.length === 0 ? (
          <div className="text-center py-20 border rounded-xl bg-card border-dashed">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground">
              No upcoming reminders
            </h3>
            <p className="text-muted-foreground mt-1 mb-6">
              Schedule a nudge for things that matter.
            </p>
            <Button onClick={openCreate} variant="outline">
              Create a reminder
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {reminders?.map((reminder) => (
                  <motion.div
                    key={reminder.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 rounded-xl border glass flex items-start gap-4 transition-all hover:shadow-lg hover:border-primary/30"
                  >
                  <button
                    onClick={() => previewAlert(reminder)}
                    title="Preview reminder alert"
                    className="mt-1 bg-gradient-to-br from-amber-500/20 to-rose-500/20 p-2 rounded-full text-amber-500 hover:scale-110 transition-transform"
                  >
                    <Bell className="h-5 w-5" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate mb-1">
                      {reminder.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center text-foreground font-medium">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(reminder.remindAt), "MMM d, h:mm a")}
                      </span>
                      {reminder.repeat !== "none" && (
                        <span className="flex items-center capitalize">
                          <Repeat className="h-3 w-3 mr-1" />
                          {reminder.repeat}
                        </span>
                      )}
                    </div>

                    {(reminder.linkedTaskId || reminder.linkedHabitId) && (
                      <Badge
                        variant="secondary"
                        className="font-normal text-[10px]"
                      >
                        Linked to {reminder.linkedTaskId ? "Task" : "Habit"}
                      </Badge>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="-mr-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => previewAlert(reminder)}>
                        <AlertTriangle className="h-4 w-4 mr-2" /> Preview alert
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(reminder)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(reminder.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <span className="rounded-lg bg-amber-500/15 p-1.5 text-amber-500">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                {editingId ? "Edit Reminder" : "Set a New Reminder"}
              </DialogTitle>
              <DialogDescription>
                We will pop a full-screen alert when this reminder fires.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Pay rent" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="remindAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="repeat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repeat</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select repeat" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="linkedTaskId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link Task (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select task" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {tasks?.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="linkedHabitId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link Habit (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select habit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {habits?.map((h) => (
                              <SelectItem key={h.id} value={h.id}>
                                {h.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createReminder.isPending || updateReminder.isPending
                    }
                  >
                    {editingId ? "Save Changes" : "Create Reminder"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <ReminderAlert
        open={alertState.open}
        title={alertState.title}
        message={alertState.message}
        onClose={() => setAlertState((s) => ({ ...s, open: false }))}
      />
    </>
  );
}
