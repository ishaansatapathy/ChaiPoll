import logger from "../utils/logger.js";

/**
 * Middleware to log HTTP requests
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? (res.statusCode >= 500 ? "error" : "warn") : "info";

    logger.log(level, `${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("user-agent"),
      ip: req.ip,
      userId: req.user?.id || "anonymous",
    });
  });

  next();
};

/**
 * Middleware to log errors
 */
export const errorLogger = (err, req, res, next) => {
  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    statusCode: err.statusCode || 500,
    userId: req.user?.id || "anonymous",
    body: req.body,
  });

  next(err);
};

export default logger;
