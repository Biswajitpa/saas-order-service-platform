<<<<<<< HEAD
# SaaS Order & Service Management Platform (Industry-Level) — Full Stack (React + Node + MySQL)

A production-style, multi-role web app with:
- Modern dashboard UI/UX (Tailwind + Framer Motion)
- 3D animated landing hero (React Three Fiber)
- Secure auth (JWT + refresh tokens)
- Role-based access control (Admin / Manager / Staff / Client)
- Order workflow: **created → approved → assigned → in_progress → completed → archived**
- Order attachments (PDF/Image upload)
- Delivery module with live GPS updates
- MySQL database with migrations/schema
- File uploads (optional) ready, with `/uploads` static serving

## Tech Stack
- **Frontend:** React (Vite) + TypeScript, TailwindCSS, Framer Motion, React Router, Recharts, React Three Fiber (Three.js)
- **Backend:** Node.js + Express + TypeScript, mysql2, zod, bcrypt, jsonwebtoken, multer
- **DB:** MySQL 8

---

## Quick Start (Docker recommended)

### 1) Start MySQL
```bash
cd backend
cp .env.example .env
docker compose up -d
```

### 2) Install & run backend
```bash
cd backend
npm i
npm run db:migrate
npm run dev
```

Backend runs at: `http://localhost:4000`

### 3) Install & run frontend
```bash
cd frontend
npm i
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Default Accounts (after seed)
The seed inserts demo users:

- Admin: `admin@demo.com` / `Admin@123`
- Manager: `manager@demo.com` / `Manager@123`
- Staff: `staff@demo.com` / `Staff@123`
- Delivery: `delivery@demo.com` / `Delivery@123`
- Client: `client@demo.com` / `Client@123`

> Change these in production.

---

## Project Structure
```
saas-order-service-platform/
  backend/
  frontend/
```

---

## Notes
- CORS is enabled for local dev.
- Tokens:
  - Access token: short-lived
  - Refresh token: stored in httpOnly cookie (dev-friendly setup)
- If you face port conflicts, change ports in:
  - backend/.env
  - frontend/src/config.ts

## Live Map
- Deliveries page includes **Live Delivery Map** with real-time marker + route path (OSRM routing).
=======
# saas-order-service-platform
>>>>>>> 10470318588468a237ebaf46f54d31742c839436
