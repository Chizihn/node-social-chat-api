import { Router } from "express";
import FollowController from "../controllers/follow.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const followRoutes = Router();

followRoutes.post("/follow", authMiddleware, FollowController.follow);
followRoutes.post("/unfollow", authMiddleware, FollowController.unfollow);
followRoutes.get(
  "/followers/:userId",
  authMiddleware,
  FollowController.getFollowers
);
followRoutes.get(
  "/following/:userId",
  authMiddleware,
  FollowController.getFollowing
);

export default followRoutes;
