import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { HttpError } from "../utils/httpError.js";

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!result.success) {
      throw new HttpError(400, "Validation error", result.error.flatten());
    }
    // attach parsed data if needed
    (req as any).parsed = result.data;
    next();
  };
}
