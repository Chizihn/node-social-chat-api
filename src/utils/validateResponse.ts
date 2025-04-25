import { Response } from "express";
import { HTTPSTATUS } from "../config/http.config";

/**
 * Utility function to validate data using a Zod schema and handle errors.
 * @param schema - The Zod schema to validate against.
 * @param data - The data to validate.
 * @param res - The Express response object.
 * @returns The parsed data if validation succeeds, or sends an error response if validation fails.
 */
export function validateAndRespond<T>(
  schema: any,
  data: unknown,
  res: Response
): T | Response {
  const result = schema.safeParse(data);

  if (!result.success) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      error: result.error.format(),
    });
  }

  return result.data;
}
