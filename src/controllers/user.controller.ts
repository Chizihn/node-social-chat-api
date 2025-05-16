import { Response, NextFunction, Request } from "express";
import UserModel from "../models/user.model";
import { searchFriendQuerySchema } from "../validators/auth.validator";
import { HTTPSTATUS } from "../config/http.config";
import { AuthenticatedRequest, CustomRequest } from "../types/custom.type";
import followService from "../services/follow.service";
import { UserService } from "../services/user.service";
import logger from "../utils/logger";
import BlockModel from "../models/block.model";

class UserController {
  async getCurrentUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
      }

      const user = await UserModel.findById(userId).select(
        "id username firstName lastName email gender dateOfBirth location hobbies interests avater bio isPrivate isVerified createdAt -password"
      );

      if (!user) {
        res.status(HTTPSTATUS.NOT_FOUND).json({ message: "User not found" });
        return;
      }

      const followers = await followService.getFollowers(user.id);
      const followersIds = followers.map((f: any) => f.follower._id.toString()); // note: f.follower not f.following

      const following = await followService.getFollowing(user.id);
      const followingIds = following.map((f: any) =>
        f.following._id.toString()
      );

      const userObj = user.toObject();

      res.status(HTTPSTATUS.OK).json({
        message: "User retrieved",
        data: {
          ...userObj,
          followers: followersIds,
          following: followingIds,
        },
      });
    } catch (error) {
      console.error("Error fetching current user:", error);
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserModel.find().select(
        "id username firstName lastName avatar isVerified isPrivate"
      );

      return res
        .status(HTTPSTATUS.OK)
        .json({ message: "Users retrieved successfully", data: users || [] });
    } catch (error) {
      console.log("Error fetching users", error);
      next(error);
    }
  }

  async getUsersExcludingCurrent(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;

      const users = await UserModel.find({ _id: { $ne: userId } }).select(
        "id username firstName lastName isVerified isPrivate"
      );

      return res
        .status(HTTPSTATUS.OK)
        .json({ message: "Users retrieved successfully", data: users || [] });
    } catch (error) {
      console.log("Error fetching users", error);
      next(error);
    }
  }

  async getUser(
    req: CustomRequest<{ id: string }, {}, {}>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id).select(
        "id username firstName lastName avatar coverImage isVerified isPrivate createdAt updatedAt interests gender bio location "
      );

      if (!user) {
        return res
          .status(HTTPSTATUS.NOT_FOUND)
          .json({ message: "User not found" });
      }

      const followers = await followService.getFollowers(user.id);
      const followersIds = followers.map((f: any) => f.follower._id.toString()); // note: f.follower not f.following

      const following = await followService.getFollowing(user.id);
      const followingIds = following.map((f: any) =>
        f.following._id.toString()
      );

      const userObj = {
        ...user.toObject(),
        followers: followersIds,
        following: followersIds,
      };

      return res.status(HTTPSTATUS.OK).json(userObj);
    } catch (error) {
      console.log("Error fetching user", error);
      next(error);
    }
  }

  async getUserByUsername(
    req: CustomRequest<{ username: string }, {}, {}>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { username } = req.params;
      const user = await UserModel.findOne({
        username: username,
      }).select(
        "id username firstName lastName avatar coverImage isVerified isPrivate createdAt updatedAt interests gender bio location -password"
      );

      if (!user) {
        return res
          .status(HTTPSTATUS.NOT_FOUND)
          .json({ message: "User not found" });
      }

      const followers = await followService.getFollowers(user.id);
      const followersIds = followers.map((f: any) => f.follower._id.toString()); // note: f.follower not f.following

      const following = await followService.getFollowing(user.id);
      const followingIds = following.map((f: any) =>
        f.following._id.toString()
      );

      const userObj = {
        ...user.toObject(),
        followers: followersIds,
        following: followingIds,
      };

      return res.status(HTTPSTATUS.OK).json(userObj);
    } catch (error) {
      console.log("Error fetching user", error);
      next(error);
    }
  }

  async searchUserByQuery(
    req: CustomRequest<{}, {}, { query: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedQuery = searchFriendQuerySchema.parse(req.query);
      const { query: searchTerm } = validatedQuery;

      const users = await UserModel.find({
        $or: [
          { username: { $regex: searchTerm, $options: "i" } },
          { firstName: { $regex: searchTerm, $options: "i" } },
          { lastName: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
        ],
      }).select("id username firstName lastName avatar location bio -password");

      // if (!users.length) {
      //   res
      //     .status(HTTPSTATUS.NOT_FOUND)
      //     .json({ message: "No users found matching the search term" });
      //   return;
      // }

      res.status(HTTPSTATUS.OK).json(users);
    } catch (error) {
      console.error("Error searching for user:", error);
      next(error);
    }
  }

  async blockUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id; // assuming you're using auth middleware
      const { targetId } = req.params;

      const result = await UserService.blockUser(userId, targetId);
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error("Error blocking user:", error);
      next(error);
    }
  }

  static async unblockUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id; // assuming you're using auth middleware
      const { targetId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "User not authenticated" });
      }

      if (userId === targetId) {
        return res.status(400).json({ error: "You cannot unblock yourself" });
      }

      const result = await UserService.unblockUser(userId, targetId);
      return res.status(200).json(result);
    } catch (error) {
      logger.error("Error unblocking user:", error);
      next(error);
    }
  }
  // Example: Get blocked users for a specific user
  static async blockedUsers(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query; // Pagination params

    try {
      const result = await UserService.getBlockedUsers(
        userId,
        Number(page),
        Number(limit)
      );

      return res.status(200).json(result);
    } catch (error) {
      // Forward error to the error handler middleware
      next(error);
    }
  }
}

export default new UserController();
