import { Router } from "express";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db, tasksTable, habitsTable, habitLogsTable, remindersTable, } from "@workspace/db";
import { GetDashboardSummaryResponse, GetWeeklyReportResponse, GetRecentActivityResponse, } from "@workspace/api-zod";
import { computeStreak, dayLabel, lastNDates, todayISO } from "../lib/dates";
const router = Router();
router.get("/dashboard/summary", async (_req, res) => {
    const tasks = await db.select().from(tasksTable);
    const habits = await db.select().from(habitsTable);
    const today = todayISO();
    const habitLogs = await db
        .select()
        .from(habitLogsTable)
        .where(eq(habitLogsTable.completed, true));
    const tasksTotal = tasks.length;
    const tasksCompleted = tasks.filter((t) => t.status === "completed").length;
    const tasksPending = tasksTotal - tasksCompleted;
    const now = new Date();
    const tasksOverdue = tasks.filter((t) => t.status === "pending" &&
        t.dueDate &&
        new Date(t.dueDate).getTime() < now.getTime()).length;
    // habits completed today
    const completedTodaySet = new Set(habitLogs.filter((l) => l.date === today).map((l) => l.habitId));
    const habitsCompletedToday = habits.filter((h) => completedTodaySet.has(h.id)).length;
    // longest streak across habits
    const logsByHabit = new Map();
    for (const l of habitLogs) {
        if (!logsByHabit.has(l.habitId))
            logsByHabit.set(l.habitId, []);
        logsByHabit.get(l.habitId).push(l.date);
    }
    let longestStreak = 0;
    for (const h of habits) {
        const ds = (logsByHabit.get(h.id) ?? []).sort();
        const s = computeStreak(ds);
        if (s > longestStreak)
            longestStreak = s;
    }
    const upcoming = await db
        .select()
        .from(remindersTable)
        .where(gte(remindersTable.remindAt, now));
    // category breakdown for tasks
    const categoryMap = new Map();
    for (const t of tasks) {
        categoryMap.set(t.category, (categoryMap.get(t.category) ?? 0) + 1);
    }
    const categoryBreakdown = Array.from(categoryMap.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
    // Productivity score (0-100): blend of task completion ratio and habits done today
    const taskRatio = tasksTotal > 0 ? tasksCompleted / tasksTotal : 0;
    const habitRatio = habits.length > 0 ? habitsCompletedToday / habits.length : 0;
    const productivityScore = Math.round((taskRatio * 0.5 + habitRatio * 0.5) * 100);
    res.json(GetDashboardSummaryResponse.parse({
        productivityScore,
        tasksTotal,
        tasksCompleted,
        tasksPending,
        tasksOverdue,
        habitsTotal: habits.length,
        habitsCompletedToday,
        longestStreak,
        upcomingRemindersCount: upcoming.length,
        categoryBreakdown,
    }));
});
router.get("/dashboard/weekly", async (_req, res) => {
    const dates = lastNDates(7);
    const habits = await db.select().from(habitsTable);
    const tasks = await db.select().from(tasksTable);
    const habitLogs = await db
        .select()
        .from(habitLogsTable)
        .where(eq(habitLogsTable.completed, true));
    const days = dates.map((d) => {
        const habitsCompleted = habitLogs.filter((l) => l.date === d).length;
        const tasksCompleted = tasks.filter((t) => t.completedAt && t.completedAt.toISOString().slice(0, 10) === d).length;
        const habitRatio = habits.length > 0 ? habitsCompleted / habits.length : 0;
        const taskComponent = Math.min(tasksCompleted / 5, 1);
        const score = Math.round((habitRatio * 0.6 + taskComponent * 0.4) * 100);
        return {
            date: d,
            label: dayLabel(d),
            tasksCompleted,
            habitsCompleted,
            score,
        };
    });
    const totalTasksCompleted = days.reduce((a, b) => a + b.tasksCompleted, 0);
    const totalHabitsCompleted = days.reduce((a, b) => a + b.habitsCompleted, 0);
    const averageScore = Math.round(days.reduce((a, b) => a + b.score, 0) / days.length);
    res.json(GetWeeklyReportResponse.parse({
        days,
        totalTasksCompleted,
        totalHabitsCompleted,
        averageScore,
    }));
});
router.get("/dashboard/activity", async (_req, res) => {
    const tasks = await db
        .select()
        .from(tasksTable)
        .orderBy(desc(tasksTable.createdAt))
        .limit(10);
    const habits = await db
        .select()
        .from(habitsTable)
        .orderBy(desc(habitsTable.createdAt))
        .limit(10);
    const reminders = await db
        .select()
        .from(remindersTable)
        .orderBy(desc(remindersTable.createdAt))
        .limit(10);
    const habitLogs = await db
        .select()
        .from(habitLogsTable)
        .where(eq(habitLogsTable.completed, true))
        .orderBy(desc(habitLogsTable.createdAt))
        .limit(10);
    const items = [];
    for (const t of tasks) {
        items.push({
            id: `task-${t.id}-created`,
            type: "task_created",
            title: t.title,
            timestamp: t.createdAt.toISOString(),
        });
        if (t.completedAt) {
            items.push({
                id: `task-${t.id}-done`,
                type: "task_completed",
                title: t.title,
                timestamp: t.completedAt.toISOString(),
            });
        }
    }
    for (const h of habits) {
        items.push({
            id: `habit-${h.id}-created`,
            type: "habit_created",
            title: h.name,
            timestamp: h.createdAt.toISOString(),
        });
    }
    for (const l of habitLogs) {
        const h = habits.find((x) => x.id === l.habitId);
        items.push({
            id: `log-${l.id}`,
            type: "habit_completed",
            title: h?.name ?? "Habit",
            timestamp: l.createdAt.toISOString(),
        });
    }
    for (const r of reminders) {
        items.push({
            id: `rem-${r.id}`,
            type: "reminder_created",
            title: r.title,
            timestamp: r.createdAt.toISOString(),
        });
    }
    items.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    res.json(GetRecentActivityResponse.parse(items.slice(0, 15)));
});
export default router;
void and;
void sql;
