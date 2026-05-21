import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
export const tasksTable = pgTable("tasks", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category").notNull().default("Personal"),
    priority: text("priority").notNull().default("medium"),
    dueDate: timestamp("due_date", { withTimezone: true }),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
});
