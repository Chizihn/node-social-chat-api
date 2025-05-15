import { Router } from "express";
import authController from "../controllers/auth.controller";
import { asyncHandler } from "../middlewares/async.middleware";

const authRoutes = Router();

authRoutes.post("/signup", authController.signup);
authRoutes.post("/signin", authController.signin);
authRoutes.post("/verify-email", authController.verifyEmail);
authRoutes.post("/resend-verify-email", authController.resendVerifyEmail);
authRoutes.post(
  "/forgot-password",
  asyncHandler(authController.forgotPassword)
);
authRoutes.post(
  "/confirm-reset-code",
  asyncHandler(authController.confirmResetCode)
);

authRoutes.post("/reset-password", asyncHandler(authController.resetPassword));

authRoutes.post("/logout", authController.logout);

export default authRoutes;
