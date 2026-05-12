import express from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import passportConfig from "./config/passport.js";
import authRoutes from "./routes/auth.js";
import pollRoutes from "./routes/polls.js";
import voteRoutes from "./routes/votes.js";
import adminRoutes from "./routes/admin.js";
import { getAllowedOrigins } from "./utils/allowedOrigins.js";
import { requestLogger, errorLogger } from "./middleware/logger.js";
import { updateLastActive } from "./middleware/roleAuth.js";
import logger from "./utils/logger.js";
import { swaggerOptions } from "./swagger-docs.js";

export function createApp() {
  const app = express();
  const allowedOrigins = getAllowedOrigins();

  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    })
  );

  app.use(helmet());

  app.use(requestLogger);

  if (process.env.VITEST !== "true") {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: { message: "Too many requests from this IP, please try again after 15 minutes" },
    });
    app.use("/api/", limiter);
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(passport.initialize());
  passportConfig(passport);

  // Update last active timestamp for authenticated users
  app.use(updateLastActive);

  // Swagger API documentation
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/polls", pollRoutes);
  app.use("/api/v1/votes", voteRoutes);
  app.use("/api/v1/admin", adminRoutes);

  // Backward compatibility redirects
  app.use("/api/auth", authRoutes);
  app.use("/api/polls", pollRoutes);
  app.use("/api/votes", voteRoutes);
  app.use("/api/admin", adminRoutes);

  app.get("/", (req, res) => {
    res.send("ChaiPoll Nexus API is running...");
  });

  app.use(errorLogger);

  app.use((err, req, res, _next) => {
    logger.error("Unhandled error", {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode || 500,
    });
    res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  });

  return app;
}
