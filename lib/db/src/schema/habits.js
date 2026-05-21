import { pgTable, text, timestamp, uuid, date, boolean, integer, unique } from "drizzle-orm/pg-core";
export const habitsTable = pgTable("habits", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon").notNull().default("flame"),
    color: text("color").notNull().default("#8b5cf6"),
    frequency: text("frequency").notNull().default("daily"),
    difficulty: text("difficulty").notNull().default("medium"),
    bestStreak: integer("best_streak").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});
export const habitLogsTable = pgTable("habit_logs", {
    id: uuid("id").primaryKey().defaultRandom(),
    habitId: uuid("habit_id")
        .notNull()
        .references(() => habitsTable.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    completed: boolean("completed").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
}, (t) => ({
    uniqHabitDate: unique().on(t.habitId, t.date),
}));
