import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool.js";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
import type { AuthUser } from "../middleware/auth.js";
import crypto from "node:crypto";

function signAccess(user: AuthUser) {
  return jwt.sign(user, env.auth.accessSecret, { expiresIn: env.auth.accessTtlSeconds });
}

function signRefresh(payload: { id: number }) {
  const seconds = env.auth.refreshTtlDays * 24 * 60 * 60;
  return jwt.sign(payload, env.auth.refreshSecret, { expiresIn: seconds });
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.cookie.secure,
    path: "/",
  };
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function login(email: string, password: string, res: Response) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      "SELECT id, name, email, password_hash, role, is_active FROM users WHERE email=? LIMIT 1",
      [email]
    );
    // @ts-ignore
    const user = rows?.[0];
    if (!user) throw new HttpError(401, "Invalid credentials");
    if (!user.is_active) throw new HttpError(403, "Account disabled");

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    const authUser: AuthUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    const accessToken = signAccess(authUser);

    const refreshToken = signRefresh({ id: user.id });
    const refreshHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + env.auth.refreshTtlDays * 24 * 60 * 60 * 1000);

    await conn.query("INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?,?,?)", [
      user.id,
      refreshHash,
      expiresAt,
    ]);

    res.cookie("refresh_token", refreshToken, { ...cookieOptions(), maxAge: env.auth.refreshTtlDays * 24 * 60 * 60 * 1000 });

    return { accessToken, user: authUser };
  } finally {
    conn.release();
  }
}

export async function me(user: AuthUser) {
  return user;
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refresh_token;
  if (!token) throw new HttpError(401, "Missing refresh token");

  let payload: any;
  try {
    payload = jwt.verify(token, env.auth.refreshSecret) as { id: number };
  } catch {
    throw new HttpError(401, "Invalid refresh token");
  }

  const conn = await pool.getConnection();
  try {
    const tHash = hashToken(token);
    const [rows] = await conn.query(
      "SELECT id, user_id, expires_at FROM refresh_tokens WHERE user_id=? AND token_hash=? LIMIT 1",
      [payload.id, tHash]
    );
    // @ts-ignore
    const rt = rows?.[0];
    if (!rt) throw new HttpError(401, "Refresh token not found");
    if (new Date(rt.expires_at).getTime() < Date.now()) throw new HttpError(401, "Refresh token expired");

    const [uRows] = await conn.query("SELECT id, name, email, role, is_active FROM users WHERE id=? LIMIT 1", [payload.id]);
    // @ts-ignore
    const user = uRows?.[0];
    if (!user || !user.is_active) throw new HttpError(403, "Account disabled");

    const authUser: AuthUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    const accessToken = signAccess(authUser);

    return { accessToken, user: authUser };
  } finally {
    conn.release();
  }
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.refresh_token;
  res.clearCookie("refresh_token", cookieOptions());
  if (!token) return;

  const conn = await pool.getConnection();
  try {
    await conn.query("DELETE FROM refresh_tokens WHERE token_hash=?", [hashToken(token)]);
  } finally {
    conn.release();
  }
}
