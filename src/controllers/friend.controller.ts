import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest, CustomRequest } from "../types/custom.type";
import FriendModel from "../models/friend.model";
import UserModel from "../models/user.model";
import { searchFriendQuerySchema } from "../validators/auth.validator";
import { HTTPSTATUS } from "../config/http.config";
import { FriendshipStatus } from "../enums/user.enum";
import mongoose from "mongoose";

class FriendController {
  async getFriends(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;

      const friendships = await FriendModel.find({
        $or: [
          { requester: userId, status: FriendshipStatus.ACCEPTED },
          { recipient: userId, status: FriendshipStatus.ACCEPTED },
        ],
      })
        .populate(
          "requester",
          "id username firstName lastName email avatar location bio -password"
        )
        .populate(
          "recipient",
          "id username firstName lastName email avatar location bio -password"
        );

      // if (!friendships.length) {
      //   return res
      //     .status(HTTPSTATUS.OK)
      //     .json({ message: "You do not have any friends." });
      // }

      const friends = friendships.map((friendship) =>
        friendship.requester._id.toString() === userId.toString()
          ? friendship.recipient
          : friendship.requester
      );

      return res.status(HTTPSTATUS.OK).json({
        data: friends || [],
      });
    } catch (error) {
      console.log("Error getting friends", error);
      next(error);
    }
  }

  async getFriend(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      const friendship = await FriendModel.findOne({
        $or: [
          {
            requester: userId,
            recipient: id,
            status: FriendshipStatus.ACCEPTED,
          },
          {
            requester: id,
            recipient: userId,
            status: FriendshipStatus.ACCEPTED,
          },
        ],
      })
        .populate("requester", "username email")
        .populate("recipient", "username email");

      if (!friendship) {
        return res
          .status(HTTPSTATUS.NOT_FOUND)
          .json({ message: "Friend not found" });
      }

      const friendData =
        friendship.requester._id.toString() === userId.toString()
          ? friendship.recipient
          : friendship.requester;

      return res.status(HTTPSTATUS.OK).json(friendData);
    } catch (error) {
      console.log("Error getting friend", error);
      next(error);
    }
  }

  async searchFriendByQuery(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res
          .status(HTTPSTATUS.UNAUTHORIZED)
          .json({ message: "User not authenticated" });
      }

      const { query: searchTerm } = searchFriendQuerySchema.parse(req.query);

      const friendships = await FriendModel.find({
        $or: [
          { requester: userId, status: FriendshipStatus.ACCEPTED },
          { recipient: userId, status: FriendshipStatus.ACCEPTED },
        ],
      });

      const friendIds = friendships.map((friendship) =>
        friendship.requester.toString() === userId.toString()
          ? friendship.recipient
          : friendship.requester
      );

      const friends = await UserModel.find({
        _id: { $in: friendIds },
        $or: [
          { username: { $regex: searchTerm, $options: "i" } },
          { firstName: { $regex: searchTerm, $options: "i" } },
          { lastName: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
        ],
      }).select("username email avatar location bio -password");

      if (!friends.length) {
        return res
          .status(HTTPSTATUS.OK)
          .json({ message: "No friends found matching the search term" });
      }

      return res.status(HTTPSTATUS.OK).json(friends);
    } catch (error) {
      console.log("Error searching for friend", error);
      next(error);
    }
  }

  async sendFriendRequest(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const requesterId = req.user?._id;
      const { recipientId } = req.body;

      const recipientObjectId = mongoose.Types.ObjectId.isValid(recipientId)
        ? new mongoose.Types.ObjectId(recipientId)
        : recipientId;

      console.log("rec", { recipientId, recipientObjectId });

      if (requesterId.toString() === recipientObjectId.toString()) {
        return res
          .status(400)
          .json({ message: "You cannot send a friend request to yourself" });
      }

      const existingRequest = await FriendModel.findOne({
        $or: [
          { requester: requesterId, recipient: recipientObjectId },
          { requester: recipientObjectId, recipient: requesterId },
        ],
      });

      if (existingRequest) {
        return res.status(HTTPSTATUS.CONFLICT).json({
          message: "A friend request already exists between these users",
          status: existingRequest.status,
        });
      }

      const newRequest = await FriendModel.create({
        requester: requesterId,
        recipient: recipientObjectId,
        status: FriendshipStatus.PENDING,
      });

      return res.status(HTTPSTATUS.CREATED).json({
        message: "Friend request sent successfully",
        request: newRequest,
      });
    } catch (error) {
      console.log("Error sending friend request", error);
      next(error);
    }
  }

  async acceptFriendRequest(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      const { requestId } = req.body;

      const request = await FriendModel.findOne({
        _id: requestId,
        recipient: userId,
        status: FriendshipStatus.PENDING,
      });

      if (!request) {
        return res.status(HTTPSTATUS.NOT_FOUND).json({
          message: "Friend request not found or cannot be accepted",
        });
      }

      request.status = FriendshipStatus.ACCEPTED;
      await request.save();

      return res.status(HTTPSTATUS.OK).json({
        message: "Friend request accepted",
        request,
      });
    } catch (error) {
      console.log("Error accepting friend request", error);
      next(error);
    }
  }

  async rejectFriendRequest(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user._id;
      const { requestId } = req.body;

      const friendRequest = await FriendModel.findById(requestId);

      if (!friendRequest || friendRequest.status !== FriendshipStatus.PENDING) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
          message: "Friend request not found or already processed",
        });
      }

      if (friendRequest.recipient.toString() !== userId.toString()) {
        return res.status(HTTPSTATUS.FORBIDDEN).json({
          message: "You can only reject requests sent to you",
        });
      }

      friendRequest.status = FriendshipStatus.REJECTED;
      await friendRequest.save();

      return res
        .status(HTTPSTATUS.OK)
        .json({ message: "Friend request rejected" });
    } catch (error) {
      console.log("Error rejecting friend request", error);
      next(error);
    }
  }

  async friendRequests(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;

      const friendRequests = await FriendModel.find({
        recipient: userId,
        status: FriendshipStatus.PENDING,
      })
        .populate("requester", "id username firstName lastName avatar")
        .populate("recipient", "id username firstName lastName avatar");

      return res.status(HTTPSTATUS.OK).json({
        message: "Friend requests retrieved successfully.",
        data: friendRequests || [],
      });
    } catch (error) {
      console.log("Error retrieving friend requests", error);
      next(error);
    }
  }

  async sentRequests(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;

      const sentRequests = await FriendModel.find({
        requester: userId,
        status: FriendshipStatus.PENDING,
      })
        .populate("requester", "id")
        .populate("recipient", "id");

      return res.status(HTTPSTATUS.OK).json({
        message: "Sent friend requests retrieved successfully.",
        data: sentRequests || [],
      });
    } catch (error) {
      console.log("Error retrieving sent requests", error);
      next(error);
    }
  }

  async removeFriend(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      const { friendId } = req.body;

      const result = await FriendModel.findOneAndDelete({
        $or: [
          { requester: userId, recipient: friendId },
          { requester: friendId, recipient: userId },
        ],
        status: FriendshipStatus.ACCEPTED,
      });

      if (!result) {
        return res
          .status(HTTPSTATUS.NOT_FOUND)
          .json({ message: "Friendship not found" });
      }

      return res
        .status(HTTPSTATUS.OK)
        .json({ message: "Friend removed successfully" });
    } catch (error) {
      next(error);
    }
  }
  async findPotentialFriends(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;

      // First, get all the user's existing friends
      const friendships = await FriendModel.find({
        $or: [
          { requester: userId, status: FriendshipStatus.ACCEPTED },
          { recipient: userId, status: FriendshipStatus.ACCEPTED },
        ],
      });

      // Extract friend IDs (people who are already friends with the current user)
      const friendIds = friendships.map((friendship) =>
        friendship.requester.toString() === userId.toString()
          ? friendship.recipient.toString()
          : friendship.requester.toString()
      );

      // Also get pending friend requests (either sent or received)
      const pendingFriendships = await FriendModel.find({
        $or: [
          { requester: userId, status: FriendshipStatus.PENDING },
          { recipient: userId, status: FriendshipStatus.PENDING },
        ],
      });

      // Extract pending request user IDs
      const pendingFriendIds = pendingFriendships.map((friendship) =>
        friendship.requester.toString() === userId.toString()
          ? friendship.recipient.toString()
          : friendship.requester.toString()
      );

      // Combine current user ID, friend IDs, and pending request IDs
      const excludeIds = [userId.toString(), ...friendIds, ...pendingFriendIds];

      // Find users excluding the current user and their friends
      const potentialFriends = await UserModel.find({
        _id: { $nin: excludeIds },
      }).select(
        "username firstName lastName email avatar location bio interests hobbies isVerified -password"
      );

      return res.status(HTTPSTATUS.OK).json({
        message: "Potential friends retrieved successfully",
        data: potentialFriends || [],
      });
    } catch (error) {
      console.log("Error fetching potential friends", error);
      next(error);
    }
  }
}

export default new FriendController();
