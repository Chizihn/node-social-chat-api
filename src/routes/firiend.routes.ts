import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncAuthHandler } from "../middlewares/async.middleware";
import {
  acceptFriendRequest,
  friendRequests,
  getFriend,
  getFriends,
  rejectFriendRequest,
  searchFriendByQuery,
  sendFriendRequest,
} from "../controllers/friend.controller";

const friendRoutes = Router();

friendRoutes.post(
  "/request/accept",
  authMiddleware,
  asyncAuthHandler(acceptFriendRequest)
);

friendRoutes.post(
  "/request/reject",
  authMiddleware,
  asyncAuthHandler(rejectFriendRequest)
);

friendRoutes.get("/friends", authMiddleware, asyncAuthHandler(getFriends));

friendRoutes.get(
  "/friends/search",
  authMiddleware,
  asyncAuthHandler(searchFriendByQuery)
);

friendRoutes.get("/friends/:id", authMiddleware, asyncAuthHandler(getFriend));

friendRoutes.post(
  "/friends/request",
  authMiddleware,
  asyncAuthHandler(sendFriendRequest)
);

friendRoutes.get(
  "/friend-requests",
  authMiddleware,
  asyncAuthHandler(friendRequests)
);

export default friendRoutes;
