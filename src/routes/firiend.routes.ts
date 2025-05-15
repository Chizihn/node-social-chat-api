import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncAuthHandler } from "../middlewares/async.middleware";
import friendController from "../controllers/friend.controller";

const friendRoutes = Router();

friendRoutes.post(
  "/request/accept",
  authMiddleware,
  asyncAuthHandler(friendController.acceptFriendRequest)
);

friendRoutes.post(
  "/request/reject",
  authMiddleware,
  asyncAuthHandler(friendController.rejectFriendRequest)
);

friendRoutes.get(
  "/friends",
  authMiddleware,
  asyncAuthHandler(friendController.getFriends)
);

friendRoutes.post(
  "/friends/remove",
  authMiddleware,
  asyncAuthHandler(friendController.removeFriend)
);

friendRoutes.get(
  "/friends/search",
  authMiddleware,
  asyncAuthHandler(friendController.searchFriendByQuery)
);

friendRoutes.get(
  "/friends/:id",
  authMiddleware,
  asyncAuthHandler(friendController.getFriend)
);

// Sent friend requests
friendRoutes.get(
  "/requests",
  authMiddleware,
  asyncAuthHandler(friendController.sentRequests)
);

friendRoutes.post(
  "/request",
  authMiddleware,
  asyncAuthHandler(friendController.sendFriendRequest)
);

friendRoutes.get(
  "/friend-requests",
  authMiddleware,
  asyncAuthHandler(friendController.friendRequests)
);

friendRoutes.get(
  "/find",
  authMiddleware,
  asyncAuthHandler(friendController.findPotentialFriends)
);
export default friendRoutes;
