import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import tasksRouter from "./tasks.js";
import habitsRouter from "./habits.js";
import remindersRouter from "./reminders.js";
import dashboardRouter from "./dashboard.js";

const router = Router();

router.use(healthRouter);
router.use(tasksRouter);
router.use(habitsRouter);
router.use(remindersRouter);
router.use(dashboardRouter);

export default router;
