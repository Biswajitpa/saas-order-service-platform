import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { pool } from "../db/pool.js";
import bcrypt from "bcryptjs";

export const usersRouter = Router();

usersRouter.get(
  "/",
  requireAuth,
  requireRole(["admin","manager"]),
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query("SELECT id, name, email, role, is_active, created_at FROM users ORDER BY id DESC LIMIT 200");
    res.json({ ok: true, users: rows });
  })
);

usersRouter.post(
  "/",
  requireAuth,
  requireRole(["admin"]),
  validate(z.object({ body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    role: z.enum(["admin","manager","staff","delivery","client"]).default("client"),
    password: z.string().min(6),
  })})),
  asyncHandler(async (req, res) => {
    const { name, email, role, password } = (req as any).parsed.body;
    const hash = await bcrypt.hash(password, 10);
    const [r] = await pool.query("INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)", [name, email, hash, role]);
    // @ts-ignore
    res.json({ ok: true, id: r.insertId });
  })
);

usersRouter.post(
  "/:id/toggle",
  requireAuth,
  requireRole(["admin"]),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    await pool.query("UPDATE users SET is_active = IF(is_active=1,0,1) WHERE id=?", [id]);
    res.json({ ok: true });
  })
);
