import { Router } from "express";
import { signup, signin, logout } from "../controllers/user.controller";

const authRoutes = Router();

authRoutes.post("/signup", signup);
authRoutes.post("/signin", signin);
authRoutes.post("/logout", logout);

export default authRoutes;
