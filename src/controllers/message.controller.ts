import { Request, Response, NextFunction } from "express";
import { MessageService } from "../services/message.service";
import { ConversationModel } from "../models/conversation.model";
import { MessageModel } from "../models/message.model";
import { HTTPSTATUS } from "../config/http.config";
import { AuthenticatedRequest } from "../types/custom.type";

export class MessageController {
  // Send a message to another user
  async sendMessage(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const senderId = req.user?._id;
      const { recipientId, text, attachments } = req.body;

      if (!text && (!attachments || attachments.length === 0)) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
          message: "Message must contain text or attachments",
        });
      }

      if (!recipientId) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
          message: "RecipientId is required",
        });
      }

      // Validate sender and recipient are different
      if (senderId.toString() === recipientId) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
          message: "You cannot send a message to yourself",
        });
      }

      const message = await MessageService.sendMessage(
        senderId,
        recipientId,
        text,
        attachments
      );

      return res.status(HTTPSTATUS.CREATED).json({
        message: "Message sent successfully",
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all conversations for the current user
  async getConversations(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      const conversations = await MessageService.getConversations(userId);

      return res.status(HTTPSTATUS.OK).json({
        message: "Conversations retrieved successfully",
        data: conversations,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get messages for a specific conversation
  async getMessages(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      const { conversationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      // Verify user is part of the conversation
      const conversation = await ConversationModel.findById(conversationId);
      if (!conversation) {
        return res.status(HTTPSTATUS.NOT_FOUND).json({
          message: "Conversation not found",
        });
      }

      const isParticipant = conversation.participants.some(
        (p) => p.toString() === userId.toString()
      );
      if (!isParticipant) {
        return res.status(HTTPSTATUS.FORBIDDEN).json({
          message: "You are not a participant in this conversation",
        });
      }

      // Mark messages as read
      await MessageService.markMessagesAsRead(conversationId, userId);

      // Get messages
      const messages = await MessageService.getMessages(
        conversationId,
        page,
        limit
      );

      return res.status(HTTPSTATUS.OK).json({
        message: "Messages retrieved successfully",
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get or create a conversation with another user
  async getOrCreateConversation(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      const { recipientId } = req.params;

      // Validate userId and recipientId are different
      if (userId.toString() === recipientId) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
          message: "Cannot create a conversation with yourself",
        });
      }

      const conversation = await MessageService.getOrCreateConversation(
        userId,
        recipientId
      );

      // Populate the conversation with user details
      await conversation.populate(
        "participants",
        "id username firstName lastName avatar"
      );

      // Format the response to match the Conversation interface
      const recipient = conversation.participants.find(
        (p: any) => p._id.toString() !== userId.toString()
      );

      const formattedConversation = {
        id: conversation._id,
        recipient,
        lastMessage: conversation.lastMessage
          ? await conversation.populate("lastMessage")
          : "",
        timestamp: conversation.updatedAt,
        unread: 0, // This would need to be calculated
        online: false, // This would need to be determined from socket connections
      };

      return res.status(HTTPSTATUS.OK).json({
        message: "Conversation retrieved successfully",
        data: formattedConversation,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete a message
  async deleteMessage(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      const { messageId } = req.params;

      const message = await MessageModel.findById(messageId);
      if (!message) {
        return res.status(HTTPSTATUS.NOT_FOUND).json({
          message: "Message not found",
        });
      }

      // Check if user is the sender of the message
      if (message.sender.toString() !== userId.toString()) {
        return res.status(HTTPSTATUS.FORBIDDEN).json({
          message: "You can only delete your own messages",
        });
      }

      await message.deleteOne();

      return res.status(HTTPSTATUS.OK).json({
        message: "Message deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MessageController();
