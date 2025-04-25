import { Router } from "express";
import authController from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/signup", authController.signup);
authRoutes.post("/signin", authController.signin);
authRoutes.post("/verify-email", authController.verifyEmail);
authRoutes.post("/resend-verify-email", authController.resendVerifyEmail);
authRoutes.post("/logout", authController.signin);

export default authRoutes;
