import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncAuthHandler } from "../middlewares/async.middleware";
import { ProfileController } from "../controllers/profile.controller";
import upload from "../utils/multer";

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
profileRoutes.put(
  "/profile/update-avatar",
  authMiddleware,
  upload.single("avatar"),
  asyncAuthHandler(ProfileController.updateAvatar)
);

// Toggle profile privacy
profileRoutes.put(
  "/profile/privacy",
  authMiddleware,
  asyncAuthHandler(ProfileController.togglePrivacy)
);

// Update profile cover image
profileRoutes.put(
  "/profile/update-cover-image",
  authMiddleware,
  upload.single("coverImage"),
  asyncAuthHandler(ProfileController.updateCoverImage)
);

export default profileRoutes;
