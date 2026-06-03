import { Router, type IRouter } from "express";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import {
  db,
  habitsTable,
  habitLogsTable,
  type HabitRow,
} from "@workspace/db";
import {
  ListHabitsResponse,
  CreateHabitBody,
  GetHabitParams,
  GetHabitResponse,
  UpdateHabitParams,
  UpdateHabitBody,
  UpdateHabitResponse,
  DeleteHabitParams,
  CheckInHabitParams,
  CheckInHabitResponse,
} from "@workspace/api-zod";
import { computeStreak, dateNDaysAgoISO, todayISO } from "../lib/dates";

const router = Router();

async function getStreakInfo(habitId: string) {
  const logs = await db
    .select({ date: habitLogsTable.date })
    .from(habitLogsTable)
    .where(
      and(
        eq(habitLogsTable.habitId, habitId),
        eq(habitLogsTable.completed, true),
      ),
    );
  const dates = logs.map((l) => l.date).sort();
  const streak = computeStreak(dates);
  const today = todayISO();
  const completedToday = dates.includes(today);
  return { streak, completedToday, completedDates: dates };
}

function serializeBase(h: HabitRow, streak: number, completedToday: boolean) {
  return {
    id: h.id,
    name: h.name,
    description: h.description,
    icon: h.icon,
    color: h.color,
    frequency: h.frequency as "daily" | "weekly",
    difficulty: h.difficulty as "easy" | "medium" | "hard",
    streak,
    bestStreak: Math.max(h.bestStreak, streak),
    completedToday,
    createdAt: h.createdAt.toISOString(),
  };
}

router.get("/habits", async (_req: any, res: any): Promise<void> => {
  const habits = await db
    .select()
    .from(habitsTable)
    .orderBy(desc(habitsTable.createdAt));
  const out = await Promise.all(
    habits.map(async (h) => {
      const info = await getStreakInfo(h.id);
      return serializeBase(h, info.streak, info.completedToday);
    }),
  );
  res.json(ListHabitsResponse.parse(out));
});

router.post("/habits", async (req: any, res: any): Promise<void> => {
  const parsed = CreateHabitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(habitsTable)
    .values({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      icon: parsed.data.icon,
      color: parsed.data.color,
      frequency: parsed.data.frequency,
      difficulty: parsed.data.difficulty,
    })
    .returning();
  const info = await getStreakInfo(row!.id);
  res.status(201).json(serializeBase(row!, info.streak, info.completedToday));
});

router.get("/habits/:id", async (req: any, res: any): Promise<void> => {
  const params = GetHabitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [habit] = await db
    .select()
    .from(habitsTable)
    .where(eq(habitsTable.id, params.data.id));
  if (!habit) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }
  const info = await getStreakInfo(habit.id);
  // Recent 30 days log array
  const recentLogs: { date: string; completed: boolean }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = dateNDaysAgoISO(i);
    recentLogs.push({ date: d, completed: info.completedDates.includes(d) });
  }
  const last30Completed = recentLogs.filter((l) => l.completed).length;
  const completionRate = Math.round((last30Completed / 30) * 100);

  const base = serializeBase(habit, info.streak, info.completedToday);
  res.json(GetHabitResponse.parse({ ...base, recentLogs, completionRate }));
});

router.patch("/habits/:id", async (req: any, res: any): Promise<void> => {
  const params = UpdateHabitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateHabitBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const updates: Partial<HabitRow> = {};
  if (body.data.name !== undefined) updates.name = body.data.name;
  if (body.data.description !== undefined)
    updates.description = body.data.description ?? null;
  if (body.data.icon !== undefined) updates.icon = body.data.icon;
  if (body.data.color !== undefined) updates.color = body.data.color;
  if (body.data.frequency !== undefined) updates.frequency = body.data.frequency;
  if (body.data.difficulty !== undefined)
    updates.difficulty = body.data.difficulty;

  const [row] = await db
    .update(habitsTable)
    .set(updates)
    .where(eq(habitsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }
  const info = await getStreakInfo(row.id);
  res.json(
    UpdateHabitResponse.parse(
      serializeBase(row, info.streak, info.completedToday),
    ),
  );
});

router.delete("/habits/:id", async (req: any, res: any): Promise<void> => {
  const params = DeleteHabitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(habitsTable)
    .where(eq(habitsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/habits/:id/check-in", async (req: any, res: any): Promise<void> => {
  const params = CheckInHabitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [habit] = await db
    .select()
    .from(habitsTable)
    .where(eq(habitsTable.id, params.data.id));
  if (!habit) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }
  const today = todayISO();
  const [existing] = await db
    .select()
    .from(habitLogsTable)
    .where(
      and(
        eq(habitLogsTable.habitId, habit.id),
        eq(habitLogsTable.date, today),
      ),
    );
  if (existing) {
    await db
      .delete(habitLogsTable)
      .where(eq(habitLogsTable.id, existing.id));
  } else {
    await db
      .insert(habitLogsTable)
      .values({ habitId: habit.id, date: today, completed: true });
  }

  const info = await getStreakInfo(habit.id);
  // update bestStreak if needed
  if (info.streak > habit.bestStreak) {
    await db
      .update(habitsTable)
      .set({ bestStreak: info.streak })
      .where(eq(habitsTable.id, habit.id));
  }
  const [refreshed] = await db
    .select()
    .from(habitsTable)
    .where(eq(habitsTable.id, habit.id));
  res.json(
    CheckInHabitResponse.parse(
      serializeBase(refreshed!, info.streak, info.completedToday),
    ),
  );
});

export default router;
// silence unused import warning
void gte;
void sql;
