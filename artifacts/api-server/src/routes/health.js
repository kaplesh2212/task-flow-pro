import { Router } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { db, tasksTable } from "@workspace/db";
import { sql } from "drizzle-orm";
const router = Router();
router.get("/healthz", async (_req, res) => {
    try {
        // 1. Basic connectivity check
        await db.execute(sql `SELECT 1`);
        // 2. Schema check - try to count tasks to ensure table exists
        const taskCount = await db.select({ count: sql `count(*)` }).from(tasksTable);
        const data = HealthCheckResponse.parse({ status: "ok" });
        res.json({
            ...data,
            database: "connected",
            tables: "verified",
            count: taskCount[0].count
        });
    }
    catch (error) {
        console.error("[Health Check Failed]", error);
        res.status(503).json({
            status: "error",
            message: "Database connection or schema error",
            details: error.message,
            hint: "Check if DATABASE_URL is correct and migrations have been run."
        });
    }
});
export default router;
