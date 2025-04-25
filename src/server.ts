import express from "express";
import connectDB from "./config/db";
import settings from "./config/settings";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware";
import profileRoutes from "./routes/profile.routes";
import authRoutes from "./routes/auth.routes";
import friendRoutes from "./routes/firiend.routes";
import userRoutes from "./routes/user.routes";
import postRoutes from "./routes/post.routes";
import followRoutes from "./routes/follow.routes";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/", profileRoutes);
app.use("/api/", userRoutes);
app.use("/api/", friendRoutes);
app.use("/api/", followRoutes);
app.use("/api/", postRoutes);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(settings.PORT, () => {
      console.log(`Server is running on port ${settings.PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to database", err);
    process.exit(1); // Exit if DB connection fails
  }
};

startServer();
