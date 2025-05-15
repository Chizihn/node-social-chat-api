import FollowModel from "../models/follow.model";
import { NotificationType } from "../models/notification.model";
import UserModel from "../models/user.model";
import { NotificationService } from "./notification.service";

class FollowService {
  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error("You cannot follow yourself");
    }

    const existingFollow = await FollowModel.findOne({
      follower: followerId,
      following: followingId,
    });

    if (existingFollow) {
      throw new Error("You are already following this user");
    }

    const user = await UserModel.findById(followerId);

    const notificationContent = `${
      user?.firstName || user?.username
    } started following you`;

    await NotificationService.createNotification(
      followingId,
      followerId,
      NotificationType.NEW_FOLLOWER,
      notificationContent,
      followerId,
      "User"
    );

    return await FollowModel.create({
      follower: followerId,
      following: followingId,
    });
  }

  async unfollowUser(followerId: string, followingId: string) {
    const unfollowed = await FollowModel.findOneAndDelete({
      follower: followerId,
      following: followingId,
    });

    if (!unfollowed) {
      throw new Error("You are not following this user");
    }

    return unfollowed;
  }

  async getFollowers(userId: string) {
    return FollowModel.find({ following: userId }).populate(
      "follower",
      "id -password"
    );
  }

  async getFollowing(userId: string) {
    return FollowModel.find({ follower: userId }).populate(
      "following",
      "id -password"
    );
  }
}

export default new FollowService();
