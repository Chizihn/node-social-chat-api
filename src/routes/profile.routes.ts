import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncAuthHandler } from "../middlewares/async.middleware";
import { ProfileController } from "../controllers/profile.controller";

const profileRoutes = Router();

// Get user profile
profileRoutes.get(
  "/profile",
  authMiddleware,
  asyncAuthHandler(ProfileController.getProfile)
);

// Update profile information
profileRoutes.put(
  "/profile/update",
  authMiddleware,
  asyncAuthHandler(ProfileController.updateProfile)
);

// Update profile avatar
profileRoutes.post(
  "/profile/upload-avatar",
  authMiddleware,
  asyncAuthHandler(ProfileController.updateAvatar)
);

// Toggle profile privacy
profileRoutes.put(
  "/profile/privacy",
  authMiddleware,
  asyncAuthHandler(ProfileController.togglePrivacy)
);

// Update profile cover image
profileRoutes.post(
  "/profile/upload-cover",
  authMiddleware,
  asyncAuthHandler(ProfileController.updateCoverImage)
);

export default profileRoutes;
