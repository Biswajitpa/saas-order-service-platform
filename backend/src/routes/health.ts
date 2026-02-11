import { Router } from "express";
import { pingDb } from "../db/pool.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  await pingDb();
  res.json({ ok: true, service: "backend", time: new Date().toISOString() });
});
