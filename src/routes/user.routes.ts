import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncAuthHandler } from "../middlewares/async.middleware";
import {
  getActiveUser,
  getActiveUsers,
} from "../controllers/friend.controller";
import { searchUserByQuery } from "../controllers/user.controller";

const userRoutes = Router();

userRoutes.get("/users", authMiddleware, asyncAuthHandler(getActiveUsers));
userRoutes.get(
  "/users/search",
  authMiddleware,
  asyncAuthHandler(searchUserByQuery)
);
userRoutes.get("/users/:id", authMiddleware, asyncAuthHandler(getActiveUser));

export default userRoutes;
