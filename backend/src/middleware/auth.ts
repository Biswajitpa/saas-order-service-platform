import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

export type Role = "admin" | "manager" | "staff" | "delivery" | "client";

export type AuthUser = {
  id: number;
  role: Role;
  email: string;
  name: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) throw new HttpError(401, "Missing access token");

  try {
    const payload = jwt.verify(token, env.auth.accessSecret) as AuthUser;
    req.user = payload;
    next();
  } catch {
    throw new HttpError(401, "Invalid or expired access token");
  }
}

export function requireRole(roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      throw new HttpError(403, "Forbidden");
    }
    next();
  };
}
