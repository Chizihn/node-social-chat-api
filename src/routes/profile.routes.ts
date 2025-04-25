import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncAuthHandler } from "../middlewares/async.middleware";
import {
  getCurrentUserProfile,
  updateAvatar,
  updateUserProfile,
} from "../controllers/profile.controller";

const profileRoutes = Router();

profileRoutes.get(
  "/profile",
  authMiddleware,
  asyncAuthHandler(getCurrentUserProfile)
);
profileRoutes.put(
  "/profile/update",
  authMiddleware,
  asyncAuthHandler(updateUserProfile)
);

profileRoutes.put(
  "/profile/update-avatar",
  authMiddleware,
  asyncAuthHandler(updateAvatar)
);

export default profileRoutes;
