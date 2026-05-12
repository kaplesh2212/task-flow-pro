import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const rawPort = process.env.PORT;
const port = rawPort && !Number.isNaN(Number(rawPort)) && Number(rawPort) > 0
  ? Number(rawPort)
  : 5173;

const basePath = process.env.BASE_PATH || "/";

let mockHabits: any[] = [
  { id: '1', name: 'Read a book', icon: 'B', color: '#3b82f6', frequency: 'daily', difficulty: 'easy', streak: 5, bestStreak: 12, completedToday: true, createdAt: new Date().toISOString() },
  { id: '2', name: 'Exercise', icon: 'E', color: '#10b981', frequency: 'daily', difficulty: 'hard', streak: 2, bestStreak: 5, completedToday: false, createdAt: new Date().toISOString() },
  { id: '3', name: 'Meditate', icon: 'M', color: '#8b5cf6', frequency: 'daily', difficulty: 'medium', streak: 0, bestStreak: 7, completedToday: false, createdAt: new Date().toISOString() }
];

let mockTasks: any[] = [
  { id: '1', title: 'Finish mockups', description: 'Complete the UI designs', category: 'Work', priority: 'high', dueDate: new Date().toISOString(), status: 'completed', createdAt: new Date().toISOString() },
  { id: '2', title: 'Buy groceries', description: 'Milk, eggs, bread', category: 'Personal', priority: 'medium', dueDate: new Date().toISOString(), status: 'pending', createdAt: new Date().toISOString() },
  { id: '3', title: 'Call mom', description: null, category: 'Personal', priority: 'low', dueDate: new Date().toISOString(), status: 'pending', createdAt: new Date().toISOString() }
];

let mockActivities: any[] = [
  { id: '1', type: 'task_completed', title: 'Finish mockups', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', type: 'habit_completed', title: 'Read a book', timestamp: new Date(Date.now() - 7200000).toISOString() }
];

let mockReminders: any[] = [
  { id: '1', title: 'Pay rent', remindAt: new Date(Date.now() + 86400000).toISOString(), repeat: 'monthly', linkedTaskId: null, linkedHabitId: null, createdAt: new Date().toISOString() }
];

const mockApiPlugin = () => ({
  name: 'mock-api',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (!req.url?.startsWith('/api/')) return next();
      
      res.setHeader('Content-Type', 'application/json');
      
      let body = '';
      req.on('data', (chunk: any) => { body += chunk.toString(); });
      req.on('end', () => {
        let parsed: any = {};
        try { parsed = JSON.parse(body || '{}'); } catch(e){}

        if (req.method === 'GET') {
          if (req.url.startsWith('/api/dashboard/summary')) {
            const completedTasks = mockTasks.filter((t: any) => t.status === 'completed').length;
            const totalTasks = mockTasks.length;
            const completedHabits = mockHabits.filter((h: any) => h.completedToday).length;
            const totalHabits = mockHabits.length;
            
            // Dynamic productivity score calculation
            const taskScore = totalTasks > 0 ? (completedTasks / totalTasks) * 50 : 0;
            const habitScore = totalHabits > 0 ? (completedHabits / totalHabits) * 50 : 0;
            const productivityScore = Math.round(taskScore + habitScore) || 50; // default to 50 if no data

            res.end(JSON.stringify({ 
              productivityScore, 
              tasksTotal: totalTasks, 
              tasksCompleted: completedTasks, 
              tasksPending: mockTasks.filter((t: any) => t.status === 'pending').length, 
              tasksOverdue: 0, 
              habitsTotal: totalHabits, 
              habitsCompletedToday: completedHabits, 
              longestStreak: Math.max(...mockHabits.map(h => h.streak), 0), 
              upcomingRemindersCount: mockReminders.length, 
              categoryBreakdown: []
            }));
          } else if (req.url.startsWith('/api/dashboard/weekly')) {
            // Generate dynamic weekly data for the last 7 days
            const days = [];
            const now = new Date();
            for (let i = 6; i >= 0; i--) {
              const d = new Date(now);
              d.setDate(d.getDate() - i);
              const dateStr = d.toISOString().split('T')[0];
              const label = d.toLocaleDateString('en-US', { weekday: 'short' });
              
              // Simulate some historical data based on current completions
              const seed = (d.getDate() % 5) + 1;
              days.push({ 
                date: dateStr, 
                label, 
                tasksCompleted: i === 0 ? mockTasks.filter(t => t.status === 'completed').length : seed, 
                habitsCompleted: i === 0 ? mockHabits.filter(h => h.completedToday).length : Math.max(0, seed - 1), 
                score: i === 0 ? (Math.round((mockTasks.filter(t => t.status === 'completed').length / (mockTasks.length || 1)) * 50 + (mockHabits.filter(h => h.completedToday).length / (mockHabits.length || 1)) * 50)) : (seed * 15)
              });
            }
            res.end(JSON.stringify({ 
              days,
              totalTasksCompleted: days.reduce((acc, d) => acc + d.tasksCompleted, 0),
              totalHabitsCompleted: days.reduce((acc, d) => acc + d.habitsCompleted, 0),
              averageScore: Math.round(days.reduce((acc, d) => acc + d.score, 0) / 7)
            }));
          } else if (req.url.startsWith('/api/dashboard/activity')) {
            res.end(JSON.stringify(mockActivities));
          } else if (req.url.match(/^\/api\/habits\/(.+)$/) && !req.url.includes('?')) {
            const id = req.url.match(/^\/api\/habits\/(.+)$/)[1];
            const habit = mockHabits.find((h: any) => h.id === id) || mockHabits[0];
            res.end(JSON.stringify({ ...habit, completionRate: 85, recentLogs: [] }));
          } else if (req.url.startsWith('/api/habits')) {
            const urlObj = new URL(req.url, 'http://localhost');
            const limit = urlObj.searchParams.get('limit');
            let result = [...mockHabits];
            if (limit) result = result.slice(0, Number(limit));
            res.end(JSON.stringify(result));
          } else if (req.url.startsWith('/api/tasks')) {
            const urlObj = new URL(req.url, 'http://localhost');
            const status = urlObj.searchParams.get('status');
            let result = [...mockTasks];
            if (status && status !== 'all') {
              result = result.filter((t: any) => t.status === status);
            }
            res.end(JSON.stringify(result));
          } else if (req.url.startsWith('/api/reminders')) {
            res.end(JSON.stringify(mockReminders));
          } else {
            res.end(JSON.stringify([]));
          }
        } else {
          const urlBase = req.url.split('?')[0];
          const parts = urlBase.split('/');
          const id = urlBase.endsWith('/toggle') || urlBase.endsWith('/check-in') 
            ? parts[parts.length - 2] 
            : parts[parts.length - 1];

          if (req.url.startsWith('/api/habits')) {
            if (urlBase.endsWith('/check-in')) {
              const habit = mockHabits.find((h: any) => h.id === id);
              if (habit) { 
                habit.completedToday = true; 
                habit.streak += 1; 
                if (habit.streak > habit.bestStreak) habit.bestStreak = habit.streak; 
              }
              mockActivities.unshift({ id: Date.now().toString(), type: 'habit_completed', title: habit?.name || 'Habit', timestamp: new Date().toISOString() });
              res.end(JSON.stringify(habit || {}));
            } else if (req.method === 'POST') {
              const newHabit = { id: Date.now().toString(), streak: 0, bestStreak: 0, completedToday: false, createdAt: new Date().toISOString(), ...parsed };
              mockHabits.push(newHabit);
              res.end(JSON.stringify(newHabit));
            } else if (req.method === 'PATCH' || req.method === 'PUT') {
              const index = mockHabits.findIndex((h: any) => h.id === id);
              if (index !== -1) mockHabits[index] = { ...mockHabits[index], ...parsed };
              res.end(JSON.stringify(mockHabits[index] || {}));
            } else if (req.method === 'DELETE') {
              mockHabits = mockHabits.filter((h: any) => h.id !== id);
              res.end(JSON.stringify({ success: true }));
            } else {
              res.end(JSON.stringify({}));
            }
          } else if (req.url.startsWith('/api/tasks')) {
            if (urlBase.endsWith('/toggle')) {
              const index = mockTasks.findIndex((t: any) => t.id === id);
              if (index !== -1) {
                mockTasks[index].status = mockTasks[index].status === 'completed' ? 'pending' : 'completed';
                if (mockTasks[index].status === 'completed') {
                  mockActivities.unshift({ id: Date.now().toString(), type: 'task_completed', title: mockTasks[index].title, timestamp: new Date().toISOString() });
                }
              }
              res.end(JSON.stringify(mockTasks[index] || {}));
            } else if (req.method === 'POST') {
              const newTask = { id: Date.now().toString(), status: 'pending', createdAt: new Date().toISOString(), ...parsed };
              mockTasks.unshift(newTask);
              res.end(JSON.stringify(newTask));
            } else if (req.method === 'PATCH' || req.method === 'PUT') {
              const index = mockTasks.findIndex((t: any) => t.id === id);
              if (index !== -1) {
                mockTasks[index] = { ...mockTasks[index], ...parsed };
              }
              res.end(JSON.stringify(mockTasks[index] || {}));
            } else if (req.method === 'DELETE') {
              mockTasks = mockTasks.filter((t: any) => t.id !== id);
              res.end(JSON.stringify({ success: true }));
            } else {
              res.end(JSON.stringify({}));
            }
          } else if (req.url.startsWith('/api/reminders')) {
            if (req.method === 'POST') {
              const newReminder = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...parsed };
              mockReminders.push(newReminder);
              res.end(JSON.stringify(newReminder));
            } else if (req.method === 'PATCH' || req.method === 'PUT') {
              const index = mockReminders.findIndex((r: any) => r.id === id);
              if (index !== -1) mockReminders[index] = { ...mockReminders[index], ...parsed };
              res.end(JSON.stringify(mockReminders[index] || {}));
            } else if (req.method === 'DELETE') {
              mockReminders = mockReminders.filter((r: any) => r.id !== id);
              res.end(JSON.stringify({ success: true }));
            } else {
              res.end(JSON.stringify({}));
            }
          } else if (req.url.startsWith('/api/system/reset') && req.method === 'POST') {
            mockHabits = [];
            mockTasks = [];
            mockActivities = [];
            mockReminders = [];
            res.end(JSON.stringify({ success: true }));
          } else {
            res.end(JSON.stringify({}));
          }
        }
      });
    });
  }
});

export default defineConfig({
  base: basePath,
  plugins: [
    mockApiPlugin(),
    react(),
    tailwindcss(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [
          (async () => {
            const { default: runtimeErrorOverlay } = await import("@replit/vite-plugin-runtime-error-modal");
            return runtimeErrorOverlay();
          })(),
          import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({ root: path.resolve(import.meta.dirname, "..") })
          ),
          import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: false,
    host: "0.0.0.0",
    allowedHosts: true as any,
    fs: {
      strict: false,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true as any,
  },
});
