export const ErrorCodeEnum = {
  BAD_REQUEST: "ERR_BAD_REQUEST",
  UNAUTHORIZED: "ERR_UNAUTHORIZED",
  FORBIDDEN: "ERR_FORBIDDEN",
  NOT_FOUND: "ERR_NOT_FOUND",
  METHOD_NOT_ALLOWED: "ERR_METHOD_NOT_ALLOWED",
  CONFLICT: "ERR_CONFLICT",
  UNPROCESSABLE_ENTITY: "ERR_UNPROCESSABLE_ENTITY",

  INTERNAL_SERVER_ERROR: "ERR_INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE: "ERR_SERVICE_UNAVAILABLE",
  GATEWAY_TIMEOUT: "ERR_GATEWAY_TIMEOUT",

  VALIDATION_ERROR: "ERR_VALIDATION_ERROR",
  DATABASE_ERROR: "ERR_DATABASE_ERROR",
  UNEXPECTED_ERROR: "ERR_UNEXPECTED_ERROR",
  TIMEOUT_ERROR: "ERR_TIMEOUT_ERROR",
} as const;

export type ErrorCodeEnumType = keyof typeof ErrorCodeEnum;
