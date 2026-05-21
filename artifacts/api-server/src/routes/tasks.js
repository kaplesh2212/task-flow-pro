import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, tasksTable } from "../../../lib/db/src/index.js";
import { ListTasksQueryParams, ListTasksResponse, CreateTaskBody, GetTaskParams, GetTaskResponse, UpdateTaskParams, UpdateTaskBody, UpdateTaskResponse, DeleteTaskParams, ToggleTaskParams, ToggleTaskResponse, } from "../../../lib/api-zod/src/index.js";
const router = Router();
function serialize(t) {
    return {
        id: t.id,
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        dueDate: t.dueDate ? t.dueDate.toISOString() : null,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
        completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    };
}
router.get("/tasks", async (req, res) => {
    const parsed = ListTasksQueryParams.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    const { status, category, priority } = parsed.data;
    const conds = [];
    if (status && status !== "all")
        conds.push(eq(tasksTable.status, status));
    if (category)
        conds.push(eq(tasksTable.category, category));
    if (priority)
        conds.push(eq(tasksTable.priority, priority));
    const rows = await db
        .select()
        .from(tasksTable)
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(desc(tasksTable.createdAt));
    res.json(ListTasksResponse.parse(rows.map(serialize)));
});
router.post("/tasks", async (req, res) => {
    const parsed = CreateTaskBody.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    const { title, description, category, priority, dueDate } = parsed.data;
    const [row] = await db
        .insert(tasksTable)
        .values({
        title,
        description: description ?? null,
        category,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "pending",
    })
        .returning();
    res.status(201).json(GetTaskResponse.parse(serialize(row)));
});
router.get("/tasks/:id", async (req, res) => {
    const params = GetTaskParams.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const [row] = await db
        .select()
        .from(tasksTable)
        .where(eq(tasksTable.id, params.data.id));
    if (!row) {
        res.status(404).json({ error: "Task not found" });
        return;
    }
    res.json(GetTaskResponse.parse(serialize(row)));
});
router.patch("/tasks/:id", async (req, res) => {
    const params = UpdateTaskParams.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const body = UpdateTaskBody.safeParse(req.body);
    if (!body.success) {
        res.status(400).json({ error: body.error.message });
        return;
    }
    const updates = {};
    if (body.data.title !== undefined)
        updates.title = body.data.title;
    if (body.data.description !== undefined)
        updates.description = body.data.description ?? null;
    if (body.data.category !== undefined)
        updates.category = body.data.category;
    if (body.data.priority !== undefined)
        updates.priority = body.data.priority;
    if (body.data.dueDate !== undefined)
        updates.dueDate = body.data.dueDate ? new Date(body.data.dueDate) : null;
    if (body.data.status !== undefined) {
        updates.status = body.data.status;
        updates.completedAt = body.data.status === "completed" ? new Date() : null;
    }
    const [row] = await db
        .update(tasksTable)
        .set(updates)
        .where(eq(tasksTable.id, params.data.id))
        .returning();
    if (!row) {
        res.status(404).json({ error: "Task not found" });
        return;
    }
    res.json(UpdateTaskResponse.parse(serialize(row)));
});
router.delete("/tasks/:id", async (req, res) => {
    const params = DeleteTaskParams.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const [row] = await db
        .delete(tasksTable)
        .where(eq(tasksTable.id, params.data.id))
        .returning();
    if (!row) {
        res.status(404).json({ error: "Task not found" });
        return;
    }
    res.sendStatus(204);
});
router.post("/tasks/:id/toggle", async (req, res) => {
    const params = ToggleTaskParams.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const [existing] = await db
        .select()
        .from(tasksTable)
        .where(eq(tasksTable.id, params.data.id));
    if (!existing) {
        res.status(404).json({ error: "Task not found" });
        return;
    }
    const newStatus = existing.status === "completed" ? "pending" : "completed";
    const [row] = await db
        .update(tasksTable)
        .set({
        status: newStatus,
        completedAt: newStatus === "completed" ? new Date() : null,
    })
        .where(eq(tasksTable.id, params.data.id))
        .returning();
    res.json(ToggleTaskResponse.parse(serialize(row)));
});
export default router;
