import { NextFunction, Response } from "express";
import { AuthenticatedRequest, UserRequest } from "../types/custom.type";
import FriendModel from "../models/friend.model";
import { searchFriendQuerySchema } from "../validators/auth.validator";
import UserModel from "../models/user.model";
import { HTTPSTATUS } from "../config/http.config";
import { FriendshipStatus } from "../enums/user.enum";
import { Types } from "mongoose";

export const getActiveUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;

    const users = await UserModel.find({
      _id: { $ne: userId },
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    console.log("Error fetching users", error);
    next(error);
  }
};

export const getActiveUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log("Error fetching user", error);
    next(error);
  }
};

export const getFriends = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;

    const friendships = await FriendModel.find({
      $or: [
        { requester: userId, status: FriendshipStatus.ACCEPTED },
        { recipient: userId, status: FriendshipStatus.ACCEPTED },
      ],
    })
      .populate("requester", "username email")
      .populate("recipient", "username email");

    if (friendships.length === 0) {
      return res.status(200).json({ message: "You do not have any friends." });
    }

    const friends = friendships.map((friendship) => {
      if (friendship.requester._id.toString() === userId.toString()) {
        return friendship.recipient;
      }
      // Otherwise return requester (the friend)
      return friendship.requester;
    });

    return res.status(200).json(friends);
  } catch (error) {
    console.log("Error getting friends", error);
    next(error);
  }
};
export const getFriend = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    // Find the friendship document
    const friendship = await FriendModel.findOne({
      $or: [
        { requester: userId, recipient: id, status: FriendshipStatus.ACCEPTED },
        { requester: id, recipient: userId, status: FriendshipStatus.ACCEPTED },
      ],
    })
      .populate("requester", "username email")
      .populate("recipient", "username email");

    if (!friendship) {
      return res.status(404).json({ message: "Friend not found" });
    }

    // Return the friend's data (not the current user)
    const friendData =
      friendship.requester._id.toString() === userId.toString()
        ? friendship.recipient
        : friendship.requester;

    return res.status(200).json(friendData);
  } catch (error) {
    console.log("Error getting friend", error);
    next(error);
  }
};

export const searchFriendByQuery = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedQuery = searchFriendQuerySchema.parse(req.query);

    const { query: searchTerm } = validatedQuery;

    const friends = await UserModel.find({
      $or: [
        { username: { $regex: searchTerm, $options: "i" } },
        { firstName: { $regex: searchTerm, $options: "i" } },
        { lastName: { $regex: searchTerm, $options: "i" } },

        { email: { $regex: searchTerm, $options: "i" } },
      ],
    }).select("username email profileImage location bio");

    if (!friends || friends.length === 0) {
      return res
        .status(HTTPSTATUS.NOT_FOUND)
        .json({ message: "No friends found matching the search term" });
    }

    return res.status(HTTPSTATUS.OK).json(friends);
  } catch (error) {
    console.log("Error searching for friend", error);
    next(error);
  }
};

export const sendFriendRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const requesterId = req.user?._id;
    const { recipientId } = req.body;

    // Prevent sending request to self
    if (requesterId.toString() === recipientId) {
      return res.status(400).json({
        message: "You cannot send a friend request to yourself",
      });
    }

    // Check if request already exists
    const existingRequest = await FriendModel.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "A friend request already exists between these users",
        status: existingRequest.status,
      });
    }

    // Create new friend request
    const newRequest = await FriendModel.create({
      requester: requesterId,
      recipient: recipientId,
      status: FriendshipStatus.PENDING,
    });

    return res.status(201).json({
      message: "Friend request sent successfully",
      request: newRequest,
    });
  } catch (error) {
    console.log("Error sending friend request", error);
    next(error);
  }
};

// export const acceptFriendRequest = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = req.user?._id;
//     const { friendId } = req.body;

//     const friendRequest = await FriendModel.findOneAndUpdate(
//       { userId: friendId, friends: userId, status: FriendshipStatus .PENDING },
//       { status: FriendshipStatus .ACCEPTED },
//       { new: true }
//     );

//     if (!friendRequest) {
//       return res.status(HTTPSTATUS.BAD_REQUEST).json({
//         message: "No pending friend request found",
//       });
//     }

//     return res.status(HTTPSTATUS.OK).json({
//       message: "Friend request accepted",
//     });
//   } catch (error) {
//     console.log("Error accepting friend request", error);
//     next(error);
//   }
// };

// export const declineFriendRequest = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = req.user?._id;
//     const { friendId } = req.body;

//     const friendRequest = await FriendModel.findOneAndUpdate(
//       { userId: friendId, friends: userId, status: FriendshipStatus .PENDING },
//       { status: FriendshipStatus .REJECTED },
//       { new: true }
//     );

//     if (!friendRequest) {
//       return res.status(HTTPSTATUS.BAD_REQUEST).json({
//         message: "No pending friend request found",
//       });
//     }

//     return res.status(HTTPSTATUS.OK).json({
//       message: "Friend request rejected",
//     });
//   } catch (error) {
//     console.log("Error rejected friend request", error);
//     next(error);
//   }
// };

export const acceptFriendRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    const { requestId } = req.params;

    const request = await FriendModel.findOne({
      _id: requestId,
      recipient: userId,
      status: FriendshipStatus.PENDING,
    });

    if (!request) {
      return res.status(404).json({
        message: "Friend request not found or cannot be accepted",
      });
    }

    request.status = FriendshipStatus.ACCEPTED;
    await request.save();

    return res.status(200).json({
      message: "Friend request accepted",
      request,
    });
  } catch (error) {
    console.log("Error accepting friend request", error);
    next(error);
  }
};

export const rejectFriendRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.body;

    const friendRequest = await FriendModel.findById(requestId);

    if (!friendRequest || friendRequest.status !== FriendshipStatus.PENDING) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Friend request not found or already processed",
      });
    }

    friendRequest.status = FriendshipStatus.REJECTED;
    await friendRequest.save();

    return res.status(HTTPSTATUS.OK).json({
      message: "Friend request rejected",
    });
  } catch (error) {
    console.log("Error rejecting friend request", error);
    next(error);
  }
};

export const friendRequests = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    console.log("requests id", userId);

    const friendRequests = await FriendModel.find({
      $or: [
        { userId: userId, status: FriendshipStatus.PENDING },
        { friends: userId, status: FriendshipStatus.PENDING },
      ],
    });

    if (friendRequests.length === 0) {
      return res.status(HTTPSTATUS.OK).json({
        message: "No pending friend requests.",
        data: [],
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "Friend requests retrieved successfully.",
      data: friendRequests,
    });
  } catch (error) {
    console.log("Error retrieving friend requests", error);
    next(error);
  }
};
