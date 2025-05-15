import express from "express";
import notificationController from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncAuthHandler } from "../middlewares/async.middleware";

const router = express.Router();

router.use(authMiddleware);

// Get all notifications
router.get("/", asyncAuthHandler(notificationController.getNotifications));

// Mark a notification as read
router.patch(
  "/:notificationId/read",
  asyncAuthHandler(notificationController.markAsRead)
);

// Mark all notifications as read
router.patch(
  "/read-all",
  asyncAuthHandler(notificationController.markAllAsRead)
);

// Delete a notification
router.delete(
  "/:notificationId",
  asyncAuthHandler(notificationController.deleteNotification)
);

export default router;
