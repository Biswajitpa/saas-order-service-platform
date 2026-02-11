import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pool } from "../db/pool.js";

export const statsRouter = Router();

statsRouter.get(
  "/overview",
  requireAuth,
  requireRole(["admin","manager"]),
  asyncHandler(async (_req, res) => {
    const [[u]] = await pool.query<any[]>("SELECT COUNT(*) as total FROM users");
    const [[o]] = await pool.query<any[]>("SELECT COUNT(*) as total FROM orders");
    const [[open]] = await pool.query<any[]>("SELECT COUNT(*) as total FROM orders WHERE status IN ('created','approved','assigned','in_progress')");
    const [[completed]] = await pool.query<any[]>("SELECT COUNT(*) as total FROM orders WHERE status='completed'");
    const [byStatus] = await pool.query<any[]>("SELECT status, COUNT(*) as count FROM orders GROUP BY status");

    res.json({
      ok: true,
      overview: {
        users: u.total,
        orders: o.total,
        open: open.total,
        completed: completed.total,
      },
      byStatus,
    });
  })
);
