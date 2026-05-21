import { Router } from "express";
import { asc, eq } from "drizzle-orm";
import { db, remindersTable } from "../../../lib/db/src/index.js";
import { ListRemindersResponse, CreateReminderBody, DeleteReminderParams, UpdateReminderParams, UpdateReminderBody, UpdateReminderResponse, } from "../../../lib/api-zod/src/index.js";
const router = Router();
function serialize(r) {
    return {
        id: r.id,
        title: r.title,
        remindAt: r.remindAt.toISOString(),
        repeat: r.repeat,
        linkedTaskId: r.linkedTaskId,
        linkedHabitId: r.linkedHabitId,
        createdAt: r.createdAt.toISOString(),
    };
}
router.get("/reminders", async (_req, res) => {
    const rows = await db
        .select()
        .from(remindersTable)
        .orderBy(asc(remindersTable.remindAt));
    res.json(ListRemindersResponse.parse(rows.map(serialize)));
});
router.post("/reminders", async (req, res) => {
    const parsed = CreateReminderBody.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    const [row] = await db
        .insert(remindersTable)
        .values({
        title: parsed.data.title,
        remindAt: new Date(parsed.data.remindAt),
        repeat: parsed.data.repeat,
        linkedTaskId: parsed.data.linkedTaskId ?? null,
        linkedHabitId: parsed.data.linkedHabitId ?? null,
    })
        .returning();
    res.status(201).json(serialize(row));
});
router.patch("/reminders/:id", async (req, res) => {
    const params = UpdateReminderParams.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const body = UpdateReminderBody.safeParse(req.body);
    if (!body.success) {
        res.status(400).json({ error: body.error.message });
        return;
    }
    const updates = {};
    if (body.data.title !== undefined)
        updates.title = body.data.title;
    if (body.data.remindAt !== undefined)
        updates.remindAt = new Date(body.data.remindAt);
    if (body.data.repeat !== undefined)
        updates.repeat = body.data.repeat;
    const [row] = await db
        .update(remindersTable)
        .set(updates)
        .where(eq(remindersTable.id, params.data.id))
        .returning();
    if (!row) {
        res.status(404).json({ error: "Reminder not found" });
        return;
    }
    res.json(UpdateReminderResponse.parse(serialize(row)));
});
router.delete("/reminders/:id", async (req, res) => {
    const params = DeleteReminderParams.safeParse(req.params);
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const [row] = await db
        .delete(remindersTable)
        .where(eq(remindersTable.id, params.data.id))
        .returning();
    if (!row) {
        res.status(404).json({ error: "Reminder not found" });
        return;
    }
    res.sendStatus(204);
});
export default router;
