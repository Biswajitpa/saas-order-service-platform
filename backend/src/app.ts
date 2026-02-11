import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.js";

import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { servicesRouter } from "./routes/services.js";
import { ordersRouter } from "./routes/orders.js";
import { statsRouter } from "./routes/stats.js";
import { deliveriesRouter } from "./routes/deliveries.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: env.corsOrigin,
    credentials: true,
  }));
  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());

  // Static uploads
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  app.get("/", (_req, res) => res.json({ ok: true, name: "saas-platform-backend" }));

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/services", servicesRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/stats", statsRouter);
  app.use("/api/deliveries", deliveriesRouter);

  app.use(errorMiddleware);
  return app;
}
