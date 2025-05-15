import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import { HTTPSTATUS } from "../config/http.config";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: any) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        status: "error",
        message: "Validation failed",
        errors: error.errors.map((e: any) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
  };
