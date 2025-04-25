import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncAuthHandler } from "../middlewares/async.middleware";
import userController from "../controllers/user.controller";

const userRoutes = Router();

// Get the currently authenticated user
userRoutes.get(
  "/me",
  authMiddleware,
  asyncAuthHandler(userController.getCurrentUser)
);

// Get all users
userRoutes.get(
  "/users",
  authMiddleware,
  asyncAuthHandler(userController.getUsers)
);

// Get all users excluding the current user
userRoutes.get(
  "/users/exclude=me",
  authMiddleware,
  asyncAuthHandler(userController.getUsersExcludingCurrent)
);

// Search users
userRoutes.get(
  "/users/search",
  authMiddleware,
  asyncAuthHandler(userController.searchUserByQuery)
);

// Get user by ID
userRoutes.get(
  "/users/id/:id",
  authMiddleware,
  asyncAuthHandler(userController.getUser)
);

// Get user by username
userRoutes.get(
  "/users/username/:username",
  authMiddleware,
  asyncAuthHandler(userController.getUserByUsername)
);

export default userRoutes;
