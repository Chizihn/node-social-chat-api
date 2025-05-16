import { FriendshipStatus } from "../enums/user.enum";
import BlockModel from "../models/block.model";
import FriendModel from "../models/friend.model";
import UserModel from "../models/user.model";

export class UserService {
  // Get user by ID
  static async getUserById(userId: string) {
    return UserModel.findById(userId).select("-password");
  }

  // Get user by username
  static async getUserByUsername(username: string) {
    return UserModel.findOne({ username }).select("-password");
  }

  // Get user by email
  static async getUserByEmail(email: string) {
    return UserModel.findOne({ email });
  }

  // Update user profile
  static async updateUserProfile(userId: string, updateData: any) {
    return UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password");
  }

  // Search users
  static async searchUsers(query: string, limit = 10) {
    const regex = new RegExp(query, "i");
    return UserModel.find({
      $or: [
        { username: regex },
        { firstName: regex },
        { lastName: regex },
        { email: regex },
      ],
    })
      .select("-password")
      .limit(limit);
  }

  static async blockUser(userId: string, targetId: string): Promise<any> {
    if (userId === targetId) {
      throw new Error("You cannot block yourself.");
    }

    // 2. Update any existing friend requests to BLOCKED
    await FriendModel.updateMany(
      {
        $or: [
          { sender: userId, receiver: targetId },
          { sender: targetId, receiver: userId },
        ],
      },
      { status: FriendshipStatus.BLOCKED }
    );

    // 3. Insert into BlockModel (block record)
    await BlockModel.updateOne(
      { blocker: userId, blocked: targetId },
      {},
      { upsert: true, setDefaultsOnInsert: true }
    );

    return { success: true };
  }

  static async unblockUser(userId: string, targetId: string): Promise<any> {
    if (userId === targetId) {
      throw new Error("You cannot unblock yourself.");
    }

    // 1. Remove the block record
    await BlockModel.deleteOne({ blocker: userId, blocked: targetId });

    // 3. Delete any friendship request records between the two users
    await FriendModel.deleteMany({
      $or: [
        { sender: userId, receiver: targetId },
        { sender: targetId, receiver: userId },
      ],
    });

    return { success: true };
  }

  static async getBlockedUsers(
    userId: string,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      // Fetch blocked users with pagination
      const blockedUsers = await BlockModel.find({ blocker: userId })
        .skip((page - 1) * limit) // Skip to the right page
        .limit(Number(limit)); // Limit to the page size

      // Map blocked users to get only their user IDs
      const blockedUserIds = blockedUsers.map((block) => block.blocked);

      return {
        blockedUserIds,
        total: blockedUsers.length, // Total count of blocked users on that page
        page,
        limit,
      };
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      throw new Error("Failed to fetch blocked users");
    }
  }
}
