import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { pool } from "../db/pool.js";
import { HttpError } from "../utils/httpError.js";

export const servicesRouter = Router();

servicesRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query("SELECT * FROM services WHERE is_active=1 ORDER BY id DESC");
    res.json({ ok: true, services: rows });
  })
);

servicesRouter.post(
  "/",
  requireAuth,
  requireRole(["admin", "manager"]),
  validate(z.object({ body: z.object({
    name: z.string().min(2),
    description: z.string().optional().default(""),
    base_price: z.number().nonnegative().default(0),
  })})),
  asyncHandler(async (req, res) => {
    const { name, description, base_price } = (req as any).parsed.body;
    const [r] = await pool.query("INSERT INTO services (name, description, base_price) VALUES (?,?,?)", [name, description, base_price]);
    // @ts-ignore
    res.json({ ok: true, id: r.insertId });
  })
);
