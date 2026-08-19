import { env } from "../config/env.js";

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isOperational = Boolean(err.statusCode);

  if (!isOperational) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational ? err.message : "Internal server error",
    errors: err.errors || [],
    ...(env.nodeEnv === "development" && !isOperational ? { stack: err.stack } : {}),
  });
}
