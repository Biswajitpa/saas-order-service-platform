import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { pool } from "../db/pool.js";
import { HttpError } from "../utils/httpError.js";

export const deliveriesRouter = Router();

deliveriesRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const u = req.user!;
    let sql = `
      SELECT d.*, o.title as order_title, o.status as order_status, du.name as delivery_name
      FROM deliveries d
      JOIN orders o ON o.id=d.order_id
      JOIN users du ON du.id=d.delivery_user_id
    `;
    const params: any[] = [];
    if (u.role === "delivery") {
      sql += " WHERE d.delivery_user_id=? ";
      params.push(u.id);
    }
    sql += " ORDER BY d.updated_at DESC LIMIT 200";
    const [rows] = await pool.query(sql, params);
    res.json({ ok: true, deliveries: rows });
  })
);

deliveriesRouter.post(
  "/",
  requireAuth,
  requireRole(["admin","manager"]),
  validate(z.object({ body: z.object({
    order_id: z.number().int().positive(),
    delivery_user_id: z.number().int().positive(),
  })})),
  asyncHandler(async (req, res) => {
    const u = req.user!;
    const { order_id, delivery_user_id } = (req as any).parsed.body;

    const [oRows] = await pool.query("SELECT id FROM orders WHERE id=? LIMIT 1", [order_id]);
    // @ts-ignore
    if (!oRows?.[0]) throw new HttpError(404, "Order not found");

    await pool.query(
      "INSERT INTO deliveries (order_id, delivery_user_id, status) VALUES (?,?, 'assigned') ON DUPLICATE KEY UPDATE delivery_user_id=VALUES(delivery_user_id), status='assigned'",
      [order_id, delivery_user_id]
    );

    const [[d]] = await pool.query<any[]>("SELECT id FROM deliveries WHERE order_id=? LIMIT 1", [order_id]);
    await pool.query(
      "INSERT INTO delivery_events (delivery_id, actor_id, event_type, message) VALUES (?,?,?,?)",
      [d.id, u.id, "assigned", "Delivery assigned"]
    );

    res.json({ ok: true });
  })
);

deliveriesRouter.post(
  "/:id/status",
  requireAuth,
  validate(z.object({ body: z.object({
    status: z.enum(["assigned","picked_up","out_for_delivery","delivered","cancelled"]),
    message: z.string().optional().default(""),
  })})),
  asyncHandler(async (req, res) => {
    const u = req.user!;
    const id = Number(req.params.id);
    const { status, message } = (req as any).parsed.body;

    const [rows] = await pool.query("SELECT * FROM deliveries WHERE id=? LIMIT 1", [id]);
    // @ts-ignore
    const d = rows?.[0];
    if (!d) throw new HttpError(404, "Delivery not found");
    if (u.role === "delivery" && d.delivery_user_id !== u.id) throw new HttpError(403, "Not your delivery");

    await pool.query("UPDATE deliveries SET status=? WHERE id=?", [status, id]);
    await pool.query(
      "INSERT INTO delivery_events (delivery_id, actor_id, event_type, message) VALUES (?,?,?,?)",
      [id, u.id, status, message || null]
    );

    res.json({ ok: true });
  })
);

deliveriesRouter.post(
  "/:id/location",
  requireAuth,
  validate(z.object({ body: z.object({ lat: z.number(), lng: z.number() })})),
  asyncHandler(async (req, res) => {
    const u = req.user!;
    const id = Number(req.params.id);
    const { lat, lng } = (req as any).parsed.body;

    const [rows] = await pool.query("SELECT * FROM deliveries WHERE id=? LIMIT 1", [id]);
    // @ts-ignore
    const d = rows?.[0];
    if (!d) throw new HttpError(404, "Delivery not found");
    if (u.role === "delivery" && d.delivery_user_id !== u.id) throw new HttpError(403, "Not your delivery");

    await pool.query("UPDATE deliveries SET last_lat=?, last_lng=? WHERE id=?", [lat, lng, id]);
    await pool.query(
      "INSERT INTO delivery_events (delivery_id, actor_id, event_type, message, lat, lng) VALUES (?,?,?,?,?,?)",
      [id, u.id, "location", "Location update", lat, lng]
    );

    res.json({ ok: true });
  })
);

// Update destination (admin/manager)
deliveriesRouter.post(
  "/:id/destination",
  requireAuth,
  requireRole(["admin","manager"]),
  validate(z.object({ body: z.object({ lat: z.number(), lng: z.number() })})),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { lat, lng } = (req as any).parsed.body;
    const [rows] = await pool.query("SELECT id FROM deliveries WHERE id=? LIMIT 1", [id]);
    // @ts-ignore
    if (!rows?.[0]) throw new HttpError(404, "Delivery not found");

    await pool.query("UPDATE deliveries SET dest_lat=?, dest_lng=? WHERE id=?", [lat, lng, id]);
    res.json({ ok: true });
  })
);

deliveriesRouter.get(
  "/:id/events",
  requireAuth,
  asyncHandler(async (req, res) => {
    const u = req.user!;
    const id = Number(req.params.id);

    const [rows] = await pool.query("SELECT * FROM deliveries WHERE id=? LIMIT 1", [id]);
    // @ts-ignore
    const d = rows?.[0];
    if (!d) throw new HttpError(404, "Delivery not found");
    if (u.role === "delivery" && d.delivery_user_id !== u.id) throw new HttpError(403, "Not your delivery");

    const [ev] = await pool.query(
      `SELECT e.*, u.name as actor_name
       FROM delivery_events e
       LEFT JOIN users u ON u.id=e.actor_id
       WHERE e.delivery_id=? ORDER BY e.created_at DESC LIMIT 200`,
      [id]
    );
    res.json({ ok: true, events: ev });
  })
);
