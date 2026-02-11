import bcrypt from "bcryptjs";
import { pool } from "./pool.js";

async function main() {
  const conn = await pool.getConnection();
  try {
    // Clean
    await conn.query("DELETE FROM delivery_events");
    await conn.query("DELETE FROM deliveries");
    await conn.query("DELETE FROM order_attachments");
    await conn.query("DELETE FROM order_events");
    await conn.query("DELETE FROM orders");
    await conn.query("DELETE FROM services");
    await conn.query("DELETE FROM refresh_tokens");
    await conn.query("DELETE FROM users");

    const mk = async (name: string, email: string, role: string, pass: string) => {
      const hash = await bcrypt.hash(pass, 10);
      const [res] = await conn.query(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)",
        [name, email, hash, role]
      );
      // @ts-ignore
      return res.insertId as number;
    };

    const adminId = await mk("Admin", "admin@demo.com", "admin", "Admin@123");
    const managerId = await mk("Manager", "manager@demo.com", "manager", "Manager@123");
    const staffId = await mk("Staff", "staff@demo.com", "staff", "Staff@123");
    const deliveryId = await mk("Delivery", "delivery@demo.com", "delivery", "Delivery@123");
    const clientId = await mk("Client", "client@demo.com", "client", "Client@123");

    const [s1] = await conn.query(
      "INSERT INTO services (name, description, base_price) VALUES (?,?,?)",
      ["Document Printing", "Order printing, binding, and delivery", 49.0]
    );
    const [s2] = await conn.query(
      "INSERT INTO services (name, description, base_price) VALUES (?,?,?)",
      ["IoT Device Installation", "On-site setup and diagnostics for IoT kits", 299.0]
    );

    // @ts-ignore
    const service1 = s1.insertId as number;
    // @ts-ignore
    const service2 = s2.insertId as number;

    const [o1] = await conn.query(
      "INSERT INTO orders (client_id, service_id, title, details, status, priority, due_date) VALUES (?,?,?,?,?,?,?)",
      [clientId, service1, "Print 120 pages (A4, BW)", "Bind + deliver to hostel gate", "approved", "high", "2026-02-10"]
    );
    // @ts-ignore
    const order1 = o1.insertId as number;

    await conn.query(
      "UPDATE orders SET status='assigned', assigned_to=? WHERE id=?",
      [staffId, order1]
    );
    await conn.query(
      "INSERT INTO order_events (order_id, actor_id, event_type, message) VALUES (?,?,?,?)",
      [order1, managerId, "assigned", "Assigned to Staff for processing"]
    );

    // Create a delivery task (demo)
    await conn.query(
      "INSERT INTO deliveries (order_id, delivery_user_id, status) VALUES (?,?,?)",
      [order1, deliveryId, "assigned"]
    );

    await conn.query(
      "INSERT INTO orders (client_id, service_id, title, details, status, priority) VALUES (?,?,?,?,?,?)",
      [clientId, service2, "ESP32 sensor setup", "Install MQ-2 + DHT11 + dashboard integration", "created", "medium"]
    );

    console.log("✅ Seed complete.");
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
