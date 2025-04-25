import { Request, Response, NextFunction } from "express";
import FollowService from "../services/follow.service";
import { HTTPSTATUS } from "../config/http.config";
import { AuthenticatedRequest } from "../types/custom.type";

class FollowController {
  async follow(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userIdToFollow } = req.body;
      const currentUserId = req.user._id;

      const follow = await FollowService.followUser(
        currentUserId,
        userIdToFollow
      );

      res.status(HTTPSTATUS.CREATED).json({
        message: "Followed successfully",
        data: follow,
      });
    } catch (error) {
      next({ status: HTTPSTATUS.BAD_REQUEST, message: error });
    }
  }

  async unfollow(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userIdToUnfollow } = req.body;
      const currentUserId = req.user._id;

      await FollowService.unfollowUser(currentUserId, userIdToUnfollow);

      res.status(HTTPSTATUS.OK).json({
        message: "Unfollowed successfully",
      });
    } catch (error) {
      next({ status: HTTPSTATUS.BAD_REQUEST, message: error });
    }
  }

  async getFollowers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;

      const followers = await FollowService.getFollowers(userId);

      res.status(HTTPSTATUS.OK).json({
        count: followers.length,
        followers: followers.map((f) => f.follower),
      });
    } catch (error) {
      next(error);
    }
  }

  async getFollowing(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;

      const following = await FollowService.getFollowing(userId);

      res.status(HTTPSTATUS.OK).json({
        count: following.length,
        following: following.map((f) => f.following),
      });
    } catch (error) {
      next(error);
    }
  }


}

export default new FollowController();
