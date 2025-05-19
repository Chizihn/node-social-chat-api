import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { MessageService } from "../services/message.service";
import { NotificationService } from "../services/notification.service";
import { MessageStatus } from "../types/socket";
import { INotification, NotificationType } from "../models/notification.model";
import settings from "../config/settings";
import { UserService } from "./user.service";

export class SocketService {
  private io: SocketIOServer;
  private userSockets: Map<string, string> = new Map();
  private socketUsers: Map<string, string> = new Map();

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
      path: "/socket.io",
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`New socket connection: ${socket.id}`);

      // Authenticate user
      socket.on("authenticate", async (token) => {
        try {
          const decoded = jwt.verify(token, settings.JWT_SECRET) as {
            userId: string;
          };

          if (decoded && decoded.userId) {
            this.userSockets.set(decoded.userId, socket.id);
            this.socketUsers.set(socket.id, decoded.userId);

            socket.emit("authenticated", { success: true });

            // Notify friends that user is online
            this.notifyUserStatus(decoded.userId, true);

            // Send unread notification count
            const unreadCount = await NotificationService.getUnreadCount(
              decoded.userId
            );
            socket.emit("notification_count", { count: unreadCount });
          } else {
            socket.emit("authenticated", {
              success: false,
              message: "Invalid token",
            });
          }
        } catch (error) {
          socket.emit("authenticated", {
            success: false,
            message: "Authentication failed",
          });
        }
      });

      // Handle sending messages
      socket.on("send_message", async (data) => {
        try {
          const userId = this.socketUsers.get(socket.id);
          if (!userId) {
            socket.emit("error", { message: "Not authenticated" });
            return;
          }

          const { recipientId, text, attachments } = data;

          // Save message to database
          const message = await MessageService.sendMessage(
            userId,
            recipientId,
            text,
            attachments
          );

          // Create notification for new message
          const sender = await UserService.getUserById(userId);
          const notificationContent = `${
            sender?.firstName || sender?.username
          } sent you a message`;

          const notification = await NotificationService.createNotification(
            recipientId,
            userId,
            NotificationType.NEW_MESSAGE,
            notificationContent,
            message._id.toString(),
            "Message"
          );

          // Send to recipient if online
          const recipientSocketId = this.userSockets.get(recipientId);
          if (recipientSocketId) {
            this.io.to(recipientSocketId).emit("new_message", message);
            this.io
              .to(recipientSocketId)
              .emit("new_notification", notification);

            // Update message status to delivered
            const updatedMessage = await MessageService.updateMessageStatus(
              message._id,
              MessageStatus.DELIVERED
            );

            // Notify sender that message was delivered
            socket.emit("message_status", {
              messageId: message._id,
              status: MessageStatus.DELIVERED,
              timestamp: updatedMessage.updatedAt,
            });

            // Emit delivery receipt to recipient
            this.io.to(recipientSocketId).emit("message_delivered", {
              messageId: message._id,
              senderId: userId,
              timestamp: updatedMessage.updatedAt,
            });
          } else {
            // If recipient is offline, keep status as sent
            socket.emit("message_status", {
              messageId: message._id,
              status: MessageStatus.SENT,
              timestamp: message.createdAt,
            });
          }

          // Send confirmation to sender
          socket.emit("message_sent", message);
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      });

      // Handle message read status
      socket.on("mark_read", async (data) => {
        try {
          const userId = this.socketUsers.get(socket.id);
          if (!userId) {
            socket.emit("error", { message: "Not authenticated" });
            return;
          }

          const { conversationId } = data;

          // Mark messages as read in database
          await MessageService.markMessagesAsRead(conversationId, userId);

          // Find the other participant in the conversation
          const conversation = await MessageService.getOrCreateConversation(
            userId,
            data.senderId
          );

          const otherParticipantId = conversation.participants.find(
            (p: any) => p.toString() !== userId.toString()
          );

          // Notify the sender that their messages were read
          if (otherParticipantId) {
            const senderSocketId = this.userSockets.get(
              otherParticipantId.toString()
            );
            if (senderSocketId) {
              this.io.to(senderSocketId).emit("messages_read", {
                conversationId,
                readBy: userId,
              });
            }
          }
        } catch (error) {
          console.error("Error marking messages as read:", error);
          socket.emit("error", { message: "Failed to mark messages as read" });
        }
      });

      // Handle notification read status
      socket.on("mark_notification_read", async (data) => {
        try {
          const userId = this.socketUsers.get(socket.id);
          if (!userId) {
            socket.emit("error", { message: "Not authenticated" });
            return;
          }

          const { notificationId } = data;

          // Mark notification as read
          await NotificationService.markAsRead(notificationId);

          // Send updated unread count
          const unreadCount = await NotificationService.getUnreadCount(userId);
          socket.emit("notification_count", { count: unreadCount });
        } catch (error) {
          console.error("Error marking notification as read:", error);
          socket.emit("error", {
            message: "Failed to mark notification as read",
          });
        }
      });

      // Handle mark all notifications as read
      socket.on("mark_all_notifications_read", async () => {
        try {
          const userId = this.socketUsers.get(socket.id);
          if (!userId) {
            socket.emit("error", { message: "Not authenticated" });
            return;
          }

          // Mark all notifications as read
          await NotificationService.markAllAsRead(userId);

          // Send updated unread count (should be 0)
          socket.emit("notification_count", { count: 0 });
        } catch (error) {
          console.error("Error marking all notifications as read:", error);
          socket.emit("error", {
            message: "Failed to mark all notifications as read",
          });
        }
      });

      // Handle typing indicators with timestamps
      socket.on("typing", (data) => {
        const userId = this.socketUsers.get(socket.id);
        if (!userId) return;

        const recipientSocketId = this.userSockets.get(data.recipientId);
        if (recipientSocketId) {
          const timestamp = new Date();
          this.io.to(recipientSocketId).emit("user_typing", {
            conversationId: data.conversationId,
            userId,
            timestamp,
            userName: data.userName, // Include user name for better UI feedback
          });

          // Automatically clear typing indicator after timeout
          setTimeout(() => {
            this.io.to(recipientSocketId).emit("user_stop_typing", {
              conversationId: data.conversationId,
              userId,
              timestamp: new Date(),
            });
          }, 5000); // Clear after 5 seconds of inactivity
        }
      });

      // Handle stop typing indicators with timestamps
      socket.on("stop_typing", (data) => {
        const userId = this.socketUsers.get(socket.id);
        if (!userId) return;

        const recipientSocketId = this.userSockets.get(data.recipientId);
        if (recipientSocketId) {
          this.io.to(recipientSocketId).emit("user_stop_typing", {
            conversationId: data.conversationId,
            userId,
            timestamp: new Date(),
          });
        }
      });

      // Handle user presence status
      socket.on("set_presence", (status) => {
        const userId = this.socketUsers.get(socket.id);
        if (!userId) return;

        // Broadcast user presence status to all connected clients
        this.io.emit("user_presence_update", {
          userId,
          status,
          timestamp: new Date(),
        });
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        const userId = this.socketUsers.get(socket.id);
        if (userId) {
          this.userSockets.delete(userId);
          this.socketUsers.delete(socket.id);

          // Notify friends that user is offline
          this.notifyUserStatus(userId, false);
        }
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  private notifyUserStatus(userId: string, isOnline: boolean) {
    // This would typically query the database for the user's friends
    // and notify them of the user's status change
    // For simplicity, we're broadcasting to all connected clients
    this.io.emit("user_status", {
      userId,
      status: isOnline ? "online" : "offline",
    });
  }

  // Method to get online status of a user
  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  // Method to get all online users
  public getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  // Method to send a notification to a user
  public async sendNotification(userId: string, notification: INotification) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit("new_notification", notification);
    }
  }
}

// Singleton instance of the socket service
let socketServiceInstance: SocketService | null = null;

export const initSocketService = (server: any) => {
  socketServiceInstance = new SocketService(server);
  return socketServiceInstance;
};

export const getSocketService = () => {
  if (!socketServiceInstance) {
    throw new Error("Socket service not initialized");
  }
  return socketServiceInstance;
};
