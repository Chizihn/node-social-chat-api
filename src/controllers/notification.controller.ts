import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../services/notification.service";
import { AppError } from "../utils/appError";
import { AuthenticatedRequest } from "../types/custom.type";
import { HTTPSTATUS } from "../config/http.config";
import { ErrorCodeEnum } from "../enums/error.enum";

export class NotificationController {
  // Get all notifications for the current user
  async getNotifications(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await NotificationService.getNotifications(
        userId,
        page,
        limit
      );

      return res.status(HTTPSTATUS.OK).json({
        message: "Notifications retrieved successfully",
        data: result.notifications,
        unreadCount: result.unreadCount,
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark a notification as read
  async markAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      const { notificationId } = req.params;

      // Verify the notification belongs to the user
      const notification = await NotificationService.markAsRead(notificationId);

      if (!notification) {
        return next(
          new AppError(
            "Notification not found",
            HTTPSTATUS.NOT_FOUND,
            ErrorCodeEnum.RESOURCE_NOT_FOUND
          )
        );
      }

      if (notification.recipient.toString() !== userId.toString()) {
        return next(
          new AppError(
            "You are not authorized to mark this notification as read",
            HTTPSTATUS.FORBIDDEN,
            ErrorCodeEnum.FORBIDDEN
          )
        );
      }

      return res.status(HTTPSTATUS.OK).json({
        message: "Notification marked as read",
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark all notifications as read
  async markAllAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;

      await NotificationService.markAllAsRead(userId);

      return res.status(HTTPSTATUS.OK).json({
        message: "All notifications marked as read",
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete a notification
  async deleteNotification(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { notificationId } = req.params;

      // Verify the notification belongs to the user
      const notification = await NotificationService.deleteNotification(
        notificationId
      );

      if (!notification) {
        return next(
          new AppError(
            "Notification not found",
            HTTPSTATUS.NOT_FOUND,
            ErrorCodeEnum.RESOURCE_NOT_FOUND
          )
        );
      }

      return res.status(HTTPSTATUS.OK).json({
        message: "Notification deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
