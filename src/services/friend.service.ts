import { NotificationService } from "./notification.service";
import { NotificationType } from "../models/notification.model";
import FriendModel from "../models/friend.model";
import { FriendshipStatus } from "../enums/user.enum";
import UserModel from "../models/user.model";

export class FriendService {
  // Send a friend request
  static async sendFriendRequest(
    senderId: string,
    receiverId: string
  ): Promise<any> {
    // Check if there's an existing request
    const existingRequest = await FriendModel.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existingRequest) {
      throw new Error("A friend request already exists between these users");
    }

    // Create new friend request
    const friendRequest = await FriendModel.create({
      sender: senderId,
      receiver: receiverId,
      status: FriendshipStatus.PENDING,
    });

    // Create notification for friend request
    const sender = await UserModel.findById(senderId);
    const notificationContent = `${
      sender?.firstName || sender?.username
    } sent you a friend request`;

    await NotificationService.createNotification(
      receiverId,
      senderId,
      NotificationType.FRIEND_REQUEST,
      notificationContent,
      friendRequest._id?.toString(),
      "User"
    );

    return friendRequest;
  }

  // Accept a friend request
  static async acceptFriendRequest(
    requestId: string,
    userId: string
  ): Promise<any> {
    const friendRequest = await FriendModel.findById(requestId);

    if (!friendRequest) {
      throw new Error("Friend request not found");
    }

    if (friendRequest.recipient.toString() !== userId) {
      throw new Error("You can only accept friend requests sent to you");
    }

    if (friendRequest.status !== FriendshipStatus.PENDING) {
      throw new Error("This friend request has already been processed");
    }

    // Update request status
    friendRequest.status = FriendshipStatus.ACCEPTED;
    await friendRequest.save();

    // Add each user to the other's friends list
    await UserModel.findByIdAndUpdate(friendRequest.requester, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await UserModel.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.requester },
    });

    // Create notification for friend acceptance
    const recipient = await UserModel.findById(userId);
    const notificationContent = `${
      recipient?.firstName || recipient?.username
    } accepted your friend request`;

    await NotificationService.createNotification(
      friendRequest.requester.toString(),
      userId,
      NotificationType.FRIEND_ACCEPT,
      notificationContent,
      friendRequest._id?.toString(),
      "User"
    );

    return friendRequest;
  }

  // Reject a friend request
  static async rejectFriendRequest(
    requestId: string,
    userId: string
  ): Promise<any> {
    const friendRequest = await FriendModel.findById(requestId);

    if (!friendRequest) {
      throw new Error("Friend request not found");
    }

    if (friendRequest.recipient.toString() !== userId) {
      throw new Error("You can only reject friend requests sent to you");
    }

    if (friendRequest.status !== FriendshipStatus.PENDING) {
      throw new Error("This friend request has already been processed");
    }

    // Update request status
    friendRequest.status = FriendshipStatus.REJECTED;
    await friendRequest.save();

    return friendRequest;
  }

  // Get all friend requests for a user
  static async getFriendRequests(userId: string): Promise<any> {
    return FriendModel.find({
      receiver: userId,
      status: FriendshipStatus.PENDING,
    }).populate("sender", "username firstName lastName avatar");
  }

  // Get all friends for a user
  // static async getFriends(userId: string): Promise<any> {
  //   const user = await UserModel.findById(userId).populate(
  //     "friends",
  //     "username firstName lastName avatar"
  //   );

  //   return user?.friends || [];
  // }

  // Remove a friend
  static async removeFriend(userId: string, friendId: string): Promise<any> {
    // Remove each user from the other's friends list
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    });

    await UserModel.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    });

    // Update any existing friend requests to REMOVED
    await FriendModel.updateMany(
      {
        $or: [
          { sender: userId, receiver: friendId },
          { sender: friendId, receiver: userId },
        ],
      },
      { status: FriendshipStatus.REMOVED }
    );

    return { success: true };
  }
}
