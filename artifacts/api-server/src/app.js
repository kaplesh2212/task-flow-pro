import express from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
const app = express();
app.use(pinoHttp({
    logger,
    serializers: {
        req(req) {
            return {
                id: req.id,
                method: req.method,
                url: req.url?.split("?")[0],
            };
        },
        res(res) {
            return {
                statusCode: res.statusCode,
            };
        },
    },
}));
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
app.use(cors({
    origin: (process.env.NODE_ENV === "production" && allowedOrigins.length > 0) ? allowedOrigins : "*"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);
// Global Error Handler
app.use((err, req, res, next) => {
    // Use both pino and console for maximum visibility in various environments
    logger.error({ err, url: req.url, method: req.method }, "Unhandled application error");
    console.error("[API Error]", err);
    const status = err.status || 500;
    const message = (process.env.NODE_ENV === "production" && !process.env.DEBUG_ERRORS)
        ? "Internal Server Error"
        : err.message || "Unknown Error";
    res.status(status).json({
        error: message,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack
    });
});
export default app;
