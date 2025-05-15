import {
  NotificationModel,
  NotificationType,
  INotification,
} from "../models/notification.model";
import { getSocketService } from "./socket.service";

export class NotificationService {
  // Create a new notification
  static async createNotification(
    recipientId: string,
    senderId: string,
    type: NotificationType,
    content: string,
    entityId?: string,
    entityModel?: string
  ): Promise<INotification> {
    const notification = await NotificationModel.create({
      recipient: recipientId,
      sender: senderId,
      type,
      content,
      entityId,
      entityModel,
      read: false,
    });

    const populatedNotification = await notification.populate(
      "sender",
      "id username firstName lastName avatar"
    );

    try {
      // Send real-time notification via socket if recipient is online
      const socketService = getSocketService();
      socketService.sendNotification(recipientId, populatedNotification);
    } catch (error) {
      console.error("Error sending socket notification:", error);
      // Continue even if socket notification fails
    }

    return populatedNotification;
  }

  // Get notifications for a user
  static async getNotifications(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const notifications = await NotificationModel.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "id username firstName lastName avatar");

    const unreadCount = await NotificationModel.countDocuments({
      recipient: userId,
      read: false,
    });

    return {
      notifications,
      unreadCount,
    };
  }

  // Mark a notification as read
  static async markAsRead(
    notificationId: string
  ): Promise<INotification | null> {
    return NotificationModel.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<any> {
    return NotificationModel.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );
  }

  // Delete a notification
  static async deleteNotification(notificationId: string): Promise<any> {
    return NotificationModel.findByIdAndDelete(notificationId);
  }

  // Get unread notification count for a user
  static async getUnreadCount(userId: string): Promise<number> {
    return NotificationModel.countDocuments({
      recipient: userId,
      read: false,
    });
  }
}
