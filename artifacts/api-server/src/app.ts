import express, { type Express } from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: any) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: any) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? allowedOrigins : "*"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Global Error Handler to prevent stack trace leaks
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err }, "Unhandled application error");
  (res as any).status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message
  });
});

export default app;
