import rateLimit from "express-rate-limit";
import { HTTPSTATUS } from "../config/http.config";
import { ErrorCodeEnum } from "../enums/error.enum";

// Create a limiter for general API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    code: ErrorCodeEnum.RATE_LIMIT_EXCEEDED,
  },
  statusCode: HTTPSTATUS.TOO_MANY_REQUESTS,
});

// Create a stricter limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: "Too many authentication attempts, please try again later.",
    code: ErrorCodeEnum.RATE_LIMIT_EXCEEDED,
  },
  statusCode: HTTPSTATUS.TOO_MANY_REQUESTS,
});
