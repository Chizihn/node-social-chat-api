import { ErrorRequestHandler } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { ZodError, ZodIssueBase } from "zod";
import { ErrorCodeEnum } from "../enums/error.enum";

export const errorHandler: ErrorRequestHandler = async (
  error,
  req,
  res,
  next
): Promise<any> => {
  console.log(`Error occurred on ${req.path}`);
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  res.setHeader("Content-Type", "application/json");

  if (error instanceof ZodError) {
    // Extract the first error from ZodError
    const firstError = error.errors[0];
    const fieldName = firstError?.path?.join(".") || "field";
    const errorMessage = firstError?.message || "Validation error";

    return res.status(HTTPSTATUS.UNPROCESSABLE_ENTITY).json({
      message: errorMessage,
      field: fieldName,
      errors: error.errors,
      errorCode: ErrorCodeEnum.VALIDATION_ERROR,
    });
  }

  if (error instanceof SyntaxError) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: "Invalid JSON data passed",
      error: (error as Error).message || "Invalid JSON data",
    });
  }

  const statusCode = error.statusCode || HTTPSTATUS.INTERNAL_SERVER_ERROR;
  return res.status(statusCode).json({
    message: error.message || "Internal server error. Please try again later.",
    errorCode: error.errorCode || ErrorCodeEnum.INTERNAL_SERVER_ERROR,
  });
};
