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

// Accept a friend request
friendRoutes.post(
  "/request/accept",
  authMiddleware,
  asyncAuthHandler(acceptFriendRequest)
);

// Reject a friend request
friendRoutes.post(
  "/request/reject",
  authMiddleware,
  asyncAuthHandler(rejectFriendRequest)
);

// Get all friends for the current user
friendRoutes.get("/friends", authMiddleware, asyncAuthHandler(getFriends));

// Get a specific friend by ID
friendRoutes.get("/friends/:id", authMiddleware, asyncAuthHandler(getFriend));

// Search for friends by query (query parameter)
friendRoutes.get(
  "/friends/search",
  authMiddleware,
  asyncAuthHandler(searchFriendByQuery)
);

// Send a friend request
friendRoutes.post(
  "/friends/request",
  authMiddleware,
  asyncAuthHandler(sendFriendRequest)
);

// Get all pending friend requests for the current user
friendRoutes.get(
  "/friend-requests",
  authMiddleware,
  asyncAuthHandler(friendRequests)
);

export default friendRoutes;
