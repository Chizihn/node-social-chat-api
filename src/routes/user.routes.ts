import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncAuthHandler } from "../middlewares/async.middleware";
import {
  getActiveUser,
  getActiveUsers,
} from "../controllers/friend.controller";

const userRoutes = Router();

userRoutes.get("/users", authMiddleware, asyncAuthHandler(getActiveUsers));
userRoutes.get("/users/:id", authMiddleware, asyncAuthHandler(getActiveUser));

export default userRoutes;
