import express from "express";
import http from "http";
import connectDB from "./config/db";
import settings from "./config/settings";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import morgan from "morgan";
import { errorHandler } from "./middlewares/error.middleware";
import { apiLimiter, authLimiter } from "./middlewares/rateLimit.middleware";
import { swaggerSpec } from "./config/swagger";
import logger, { stream } from "./utils/logger";
import profileRoutes from "./routes/profile.routes";
import authRoutes from "./routes/auth.routes";
import friendRoutes from "./routes/firiend.routes";
import userRoutes from "./routes/user.routes";
import postRoutes from "./routes/post.routes";
import followRoutes from "./routes/follow.routes";
import messageRoutes from "./routes/message.routes";
import notificationRoutes from "./routes/notification.routes";
import { initSocketService } from "./services/socket.service";
import { attachSocketService } from "./middlewares/socket.middleware";

const app = express();
const server = http.createServer(app);
const socketService = initSocketService(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup request logging
app.use(morgan("combined", { stream }));
app.set("socketService", socketService);

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(attachSocketService);

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Apply rate limiting to auth routes
app.use("/api/auth", authLimiter, authRoutes);

// Apply general rate limiting to all other API routes
app.use("/api/", apiLimiter, profileRoutes);
app.use("/api/", userRoutes);
app.use("/api/", friendRoutes);
app.use("/api/", apiLimiter, followRoutes);
app.use("/api/", apiLimiter, postRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(settings.PORT, () => {
      logger.info(`Server is running on port ${settings.PORT}`);
      logger.info("API Documentation available at /api-docs");
    });
  } catch (err) {
    console.error("Failed to connect to database", err);
    process.exit(1); // Exit if DB connection fails
  }
};

startServer();
