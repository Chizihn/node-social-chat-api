import { Schema, model, Document } from "mongoose";
import UserModel from "../models/user.model";

interface IUserActivity extends Document {
  userId: Schema.Types.ObjectId;
  action: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

const userActivitySchema = new Schema<IUserActivity>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  details: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Index for efficient querying
userActivitySchema.index({ userId: 1, createdAt: -1 });
userActivitySchema.index({ action: 1, createdAt: -1 });

const UserActivity = model<IUserActivity>("UserActivity", userActivitySchema);

export class ActivityService {
  static async logActivity({
    userId,
    action,
    details = {},
    ipAddress,
    userAgent,
  }: {
    userId: string;
    action: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      const activity = new UserActivity({
        userId,
        action,
        details,
        ipAddress,
        userAgent,
      });

      await activity.save();

      // Update user's last activity timestamp
      await UserModel.findByIdAndUpdate(userId, {
        lastActive: new Date(),
      });

      return activity;
    } catch (error) {
      console.error("Error logging user activity:", error);
      throw error;
    }
  }

  static async getUserActivities(userId: string, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const activities = await UserActivity.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await UserActivity.countDocuments({ userId });

      return {
        activities,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching user activities:", error);
      throw error;
    }
  }

  static async getRecentActivities(limit = 10) {
    try {
      return await UserActivity.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("userId", "username name");
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      throw error;
    }
  }
}
