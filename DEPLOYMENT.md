# Deployment Guide (Vercel + Render + MySQL)

This repo is split into:
- `frontend/` (Vite React) → deploy on **Vercel**
- `backend/` (Node/Express) → deploy on **Render**
- MySQL → either run MySQL on Render (Docker + disk) or use Railway MySQL (or any managed MySQL)

## Frontend → Vercel
1. Push to GitHub.
2. Vercel → New Project → Import repo.
3. Root Directory: `frontend`
4. Build: `npm run build`
5. Output: `dist`

## Backend → Render
1. Render → New → Web Service → connect repo.
2. Root Directory: `backend`
3. Build: `npm ci && npm run build`
4. Start: `npm run start`
5. Add env vars from `backend/.env.example`

## MySQL Options
### Option A: MySQL on Render (Docker)
Render provides a MySQL Docker quickstart and lets you run MySQL as a service with persistent disk.

### Option B: MySQL on Railway
Railway lets you provision MySQL from a template quickly.

## Production Checklist
- Set `CORS_ORIGIN` to your Vercel domain
- Set `COOKIE_SECURE=true` on HTTPS
- Use strong secrets for JWT
