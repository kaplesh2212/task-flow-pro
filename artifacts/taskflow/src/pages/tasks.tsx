import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useToggleTask,
  getListTasksQueryKey,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  MoreVertical,
  Calendar,
  AlertCircle,
  Trash2,
  Edit,
  CheckCircle2,
  Circle,
  Sparkles,
  Mic,
  MicOff
} from "lucide-react";
import { cn } from "@/lib/utils";

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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sfx } from "@/lib/sfx";
import { celebrate } from "@/lib/celebrate";
import { ExternalAd } from "@/components/external-ad";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  category: z.string().min(1, "Category is required"),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().optional().nullable(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function Tasks() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening for task title...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      form.setValue("title", transcript);
      setIsListening(false);
      setIsDialogOpen(true);
      toast.success("Voice captured: " + transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Speech recognition error.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const { data: tasks, isLoading } = useListTasks(
    { status: filter },
    { query: { queryKey: getListTasksQueryKey({ status: filter }) } }
  );

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleTask = useToggleTask();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Personal",
      priority: "medium",
      dueDate: "",
    },
  });

  const onSubmit = (data: TaskFormValues) => {
    if (editingId) {
      updateTask.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
            toast.success("Task updated");
            setIsDialogOpen(false);
          }
        }
      );
    } else {
      createTask.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
            toast.success("Task created");
            setIsDialogOpen(false);
          }
        }
      );
    }
  };

  const handleToggle = (id: string, currentStatus: string) => {
    if (currentStatus === "completed") return; // Once finished, no effect on clicking

    toggleTask.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          if (currentStatus === "pending") {
            sfx.taskComplete();
            celebrate();
            toast.success("Task completed!", {
              icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
            });
          } else {
            sfx.click();
          }
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteTask.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast.success("Task deleted");
          sfx.delete();
        },
      },
    );
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ title: "", description: "", category: "Personal", priority: "medium", dueDate: "" });
    setIsDialogOpen(true);
  };

  const openEdit = (task: any) => {
    setEditingId(task.id);
    form.reset({
      title: task.title,
      description: task.description || "",
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
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
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">Tasks</h1>
              <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">Manage your to-dos and priorities.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={startListening}
                variant="outline"
                size="lg"
                className={cn("shrink-0 rounded-xl px-4", isListening && "animate-pulse border-red-500 text-red-500")}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button onClick={openCreate} size="lg" className="shadow-glow hover:scale-105 transition-all shrink-0 font-bold px-8 flex-1 sm:flex-none">
                <Plus className="h-5 w-5 mr-2" />
                New Task
              </Button>
            </div>
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

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : !Array.isArray(tasks) || tasks.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-card border-dashed">
          <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No tasks found</h3>
          <p className="text-muted-foreground mt-1 mb-6">You're all caught up or haven't created any tasks yet.</p>
          <Button onClick={openCreate} variant="outline">Create your first task</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {tasks?.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 rounded-xl border glass flex items-start gap-4 transition-all hover:shadow-md ${task.status === 'completed' ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
                onClick={() => task.status !== 'completed' && handleToggle(task.id, task.status)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(task.id, task.status); }}
                  className={`mt-1 text-primary hover:text-primary/80 transition-colors focus:outline-none ${task.status === 'completed' ? 'cursor-default' : ''}`}
                >
                  {task.status === "completed" ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold truncate ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h3>
                    {task.priority === 'high' && (
                      <Badge variant="destructive" className="h-5 px-1.5 text-[10px]"><AlertCircle className="h-3 w-3 mr-1" /> High</Badge>
                    )}
                    {task.priority === 'medium' && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">Medium</Badge>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <Badge variant="outline" className="bg-background">{task.category}</Badge>
                    {task.dueDate && (
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(task.dueDate), "MMM d")}
                      </span>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="-mr-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(task)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-destructive">
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
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Task" : "New Task"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="What needs to be done?" {...field} />
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
                      <Textarea placeholder="Add details..." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Work, Personal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createTask.isPending || updateTask.isPending}>
                  {editingId ? "Save Changes" : "Create Task"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
