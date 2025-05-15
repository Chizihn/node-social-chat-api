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

    // 1. Remove from friends if they are friends
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { friends: targetId },
    });
    await UserModel.findByIdAndUpdate(targetId, {
      $pull: { friends: userId },
    });

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
}
