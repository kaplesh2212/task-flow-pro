import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
export const remindersTable = pgTable("reminders", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    remindAt: timestamp("remind_at", { withTimezone: true }).notNull(),
    repeat: text("repeat").notNull().default("none"),
    linkedTaskId: uuid("linked_task_id"),
    linkedHabitId: uuid("linked_habit_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});
