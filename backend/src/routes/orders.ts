import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { pool } from "../db/pool.js";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HttpError } from "../utils/httpError.js";

export const ordersRouter = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(__dirname, "..", "..", "uploads")),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}-${safe}`);
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
});


const createSchema = z.object({ body: z.object({
  service_id: z.number().int().positive(),
  title: z.string().min(3),
  details: z.string().optional().default(""),
  priority: z.enum(["low","medium","high"]).default("medium"),
  due_date: z.string().optional(), // YYYY-MM-DD
})});

ordersRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = req.user!;
    let sql = `
      SELECT o.*, s.name as service_name, c.name as client_name, a.name as assignee_name, d.id as delivery_id, d.status as delivery_status, du.name as delivery_name, d.last_lat, d.last_lng
      FROM orders o
      JOIN services s ON s.id=o.service_id
      JOIN users c ON c.id=o.client_id
      LEFT JOIN users a ON a.id=o.assigned_to
      LEFT JOIN deliveries d ON d.order_id=o.id
      LEFT JOIN users du ON du.id=d.delivery_user_id
    `;
    const params: any[] = [];
    if (user.role === "client") {
      sql += " WHERE o.client_id=? ";
      params.push(user.id);
    } else if (user.role === "staff") {
      sql += " WHERE o.assigned_to=? ";
      params.push(user.id);
    }
    sql += " ORDER BY o.updated_at DESC LIMIT 200";
    const [rows] = await pool.query(sql, params);
    res.json({ ok: true, orders: rows });
  })
);

ordersRouter.post(
  "/",
  requireAuth,
  requireRole(["client","admin","manager"]),
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const { service_id, title, details, priority, due_date } = (req as any).parsed.body;
    const clientId = user.role === "client" ? user.id : user.id; // admin/manager can create too (as themselves)
    const [r] = await pool.query(
      "INSERT INTO orders (client_id, service_id, title, details, priority, due_date) VALUES (?,?,?,?,?,?)",
      [clientId, service_id, title, details, priority, due_date || null]
    );
    // @ts-ignore
    const orderId = r.insertId as number;
    await pool.query("INSERT INTO order_events (order_id, actor_id, event_type, message) VALUES (?,?,?,?)",
      [orderId, user.id, "created", "Order created"]);
    res.json({ ok: true, id: orderId });
  })
);

async function canAccessOrder(orderId: number, user: any) {
  const [rows] = await pool.query("SELECT client_id, assigned_to FROM orders WHERE id=? LIMIT 1", [orderId]);
  // @ts-ignore
  const o = rows?.[0];
  if (!o) return { ok: false, status: 404, message: "Order not found" };

  if (user.role === "admin" || user.role === "manager") return { ok: true, o };
  if (user.role === "client" && o.client_id === user.id) return { ok: true, o };
  if (user.role === "staff" && o.assigned_to === user.id) return { ok: true, o };
  if (user.role === "delivery") {
    const [dRows] = await pool.query("SELECT id FROM deliveries WHERE order_id=? AND delivery_user_id=? LIMIT 1", [orderId, user.id]);
    // @ts-ignore
    if (dRows?.[0]) return { ok: true, o };
  }
  return { ok: false, status: 403, message: "Forbidden" };
}

const statusSchema = z.object({ body: z.object({
  status: z.enum(["created","approved","assigned","in_progress","completed","archived"]),
  assigned_to: z.number().int().positive().optional(),
  message: z.string().optional().default(""),
})});

ordersRouter.post(
  "/:id/status",
  requireAuth,
  validate(statusSchema),
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new HttpError(400, "Invalid id");

    const { status, assigned_to, message } = (req as any).parsed.body;

    // Role rules
    if (["admin","manager"].includes(user.role)) {
      // ok
    } else if (user.role === "staff") {
      // staff can only move assigned orders to in_progress/completed
      if (!["in_progress","completed"].includes(status)) throw new HttpError(403, "Staff cannot set this status");
    } else if (user.role === "client") {
      throw new HttpError(403, "Client cannot change status");
    }

    // If status=assigned, require assigned_to
    if (status === "assigned" && !assigned_to) throw new HttpError(400, "assigned_to required for assigned status");

    const [rows] = await pool.query("SELECT * FROM orders WHERE id=? LIMIT 1", [id]);
    // @ts-ignore
    const order = rows?.[0];
    if (!order) throw new HttpError(404, "Order not found");

    // staff must be assignee
    if (user.role === "staff" && order.assigned_to !== user.id) throw new HttpError(403, "Not your order");

    await pool.query("UPDATE orders SET status=?, assigned_to=COALESCE(?, assigned_to) WHERE id=?", [status, assigned_to || null, id]);
    await pool.query("INSERT INTO order_events (order_id, actor_id, event_type, message) VALUES (?,?,?,?)",
      [id, user.id, status, message || null]);

    res.json({ ok: true });
  })
);

ordersRouter.get(
  "/:id/events",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const [rows] = await pool.query(
      `SELECT e.*, u.name as actor_name
       FROM order_events e
       LEFT JOIN users u ON u.id=e.actor_id
       WHERE e.order_id=? ORDER BY e.created_at DESC LIMIT 200`,
      [id]
    );
    res.json({ ok: true, events: rows });
  })
);


// List attachments
ordersRouter.get(
  "/:id/attachments",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const id = Number(req.params.id);
    const access = await canAccessOrder(id, user);
    if (!access.ok) throw new HttpError(access.status, access.message);

    const [rows] = await pool.query(
      `SELECT a.*, u.name as uploader_name
       FROM order_attachments a
       LEFT JOIN users u ON u.id=a.uploader_id
       WHERE a.order_id=? ORDER BY a.created_at DESC LIMIT 200`,
      [id]
    );
    res.json({ ok: true, attachments: rows });
  })
);

// Upload attachment (pdf/image)
ordersRouter.post(
  "/:id/attachments",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const id = Number(req.params.id);
    const access = await canAccessOrder(id, user);
    if (!access.ok) throw new HttpError(access.status, access.message);
    if (!req.file) throw new HttpError(400, "No file uploaded");

    const fileUrl = `/uploads/${req.file.filename}`;
    await pool.query(
      "INSERT INTO order_attachments (order_id, uploader_id, file_url, original_name, mime_type) VALUES (?,?,?,?,?)",
      [id, user.id, fileUrl, req.file.originalname, req.file.mimetype]
    );
    await pool.query(
      "INSERT INTO order_events (order_id, actor_id, event_type, message) VALUES (?,?,?,?)",
      [id, user.id, "attachment", `Uploaded ${req.file.originalname}`]
    );

    res.json({ ok: true, fileUrl });
  })
);
