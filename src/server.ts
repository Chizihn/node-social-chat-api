import express from "express";
import connectDB from "./config/db";
import settings from "./config/settings";
import { errorHandler } from "./middlewares/error.middleware";
import profileRoutes from "./routes/profile.routes";
import authRoutes from "./routes/auth.routes";
import friendRoutes from "./routes/firiend.routes";
import userRoutes from "./routes/user.routes";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/auth", authRoutes);
app.use("/api/", profileRoutes);
app.use("/api/", userRoutes);

app.use("/api/", friendRoutes);

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
