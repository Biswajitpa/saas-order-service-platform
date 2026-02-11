import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { login, me, refresh, logout } from "../services/authService.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post(
  "/login",
  validate(z.object({ body: z.object({ email: z.string().email(), password: z.string().min(6) }) })),
  asyncHandler(async (req, res) => {
    const { email, password } = (req as any).parsed.body;
    const out = await login(email, password, res);
    res.json({ ok: true, ...out });
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const out = await me(req.user!);
    res.json({ ok: true, user: out });
  })
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const out = await refresh(req, res);
    res.json({ ok: true, ...out });
  })
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    await logout(req, res);
    res.json({ ok: true });
  })
);
