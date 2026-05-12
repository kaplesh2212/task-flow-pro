import { eq } from "drizzle-orm";
import {
  db,
  tasksTable,
  habitsTable,
  habitLogsTable,
  remindersTable,
} from "@workspace/db";

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

async function main() {
  // Don't reseed if anything already exists
  const existing = await db.select().from(tasksTable).limit(1);
  if (existing.length > 0) {
    console.log("Data already exists, skipping seed.");
    return;
  }

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000);
  const inThreeDays = new Date(now.getTime() + 3 * 86400000);
  const yesterday = new Date(now.getTime() - 86400000);

  await db.insert(tasksTable).values([
    {
      title: "Finish design review document",
      description: "Compile feedback from yesterday's session and circulate.",
      category: "Work",
      priority: "high",
      dueDate: tomorrow,
      status: "pending",
    },
    {
      title: "Read chapter 4 of Atomic Habits",
      description: "Take notes on the cue-craving-response-reward loop.",
      category: "Study",
      priority: "medium",
      dueDate: inThreeDays,
      status: "pending",
    },
    {
      title: "Schedule dentist appointment",
      description: null,
      category: "Personal",
      priority: "low",
      dueDate: null,
      status: "pending",
    },
    {
      title: "Submit weekly status update",
      description: "Highlight blockers and next-week priorities.",
      category: "Work",
      priority: "medium",
      dueDate: yesterday,
      status: "completed",
      completedAt: yesterday,
    },
    {
      title: "Plan weekend trip itinerary",
      description: "Book hostel and reserve train tickets.",
      category: "Personal",
      priority: "low",
      dueDate: null,
      status: "pending",
    },
  ]);

  const insertedHabits = await db
    .insert(habitsTable)
    .values([
      {
        name: "Drink 8 glasses of water",
        description: "Stay hydrated through the day.",
        icon: "droplet",
        color: "#0ea5e9",
        frequency: "daily",
        difficulty: "easy",
      },
      {
        name: "30 minutes of exercise",
        description: "Walk, run, or strength train.",
        icon: "dumbbell",
        color: "#f97316",
        frequency: "daily",
        difficulty: "medium",
      },
      {
        name: "Read for 20 minutes",
        description: "Anything that isn't a screen.",
        icon: "book-open",
        color: "#8b5cf6",
        frequency: "daily",
        difficulty: "easy",
      },
      {
        name: "Meditate",
        description: "Ten quiet minutes of breath work.",
        icon: "sparkles",
        color: "#10b981",
        frequency: "daily",
        difficulty: "medium",
      },
    ])
    .returning();

  // Create logs for the past few days for streak demo
  const logs: { habitId: string; date: string; completed: boolean }[] = [];
  // Drink water: 7 day streak (today included)
  for (let i = 0; i < 7; i++) {
    logs.push({
      habitId: insertedHabits[0]!.id,
      date: dateNDaysAgo(i),
      completed: true,
    });
  }
  // Exercise: 4-day streak ending yesterday
  for (let i = 1; i <= 4; i++) {
    logs.push({
      habitId: insertedHabits[1]!.id,
      date: dateNDaysAgo(i),
      completed: true,
    });
  }
  // Reading: completed today, broken before
  logs.push({
    habitId: insertedHabits[2]!.id,
    date: dateNDaysAgo(0),
    completed: true,
  });
  logs.push({
    habitId: insertedHabits[2]!.id,
    date: dateNDaysAgo(2),
    completed: true,
  });
  logs.push({
    habitId: insertedHabits[2]!.id,
    date: dateNDaysAgo(4),
    completed: true,
  });
  // Meditate: 2-day streak ending yesterday
  for (let i = 1; i <= 2; i++) {
    logs.push({
      habitId: insertedHabits[3]!.id,
      date: dateNDaysAgo(i),
      completed: true,
    });
  }

  await db.insert(habitLogsTable).values(logs);

  const bestStreaks = [10, 7, 5, 4];
  for (let i = 0; i < insertedHabits.length; i++) {
    await db
      .update(habitsTable)
      .set({ bestStreak: bestStreaks[i]! })
      .where(eq(habitsTable.id, insertedHabits[i]!.id));
  }

  await db.insert(remindersTable).values([
    {
      title: "Stand up and stretch",
      remindAt: new Date(now.getTime() + 60 * 60 * 1000),
      repeat: "daily",
    },
    {
      title: "Wind down for sleep",
      remindAt: new Date(now.getTime() + 8 * 60 * 60 * 1000),
      repeat: "daily",
    },
    {
      title: "Review tomorrow's agenda",
      remindAt: new Date(now.getTime() + 6 * 60 * 60 * 1000),
      repeat: "none",
    },
  ]);

  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
