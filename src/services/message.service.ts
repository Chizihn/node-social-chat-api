import mongoose from "mongoose";
import { ConversationModel } from "../models/conversation.model";
import { MessageModel } from "../models/message.model";
import { MessageStatus } from "../types/socket";
import MediaModel, { TargetType } from "../models/media.model";

export class MessageService {
  // Create or get a conversation between two users
  static async getOrCreateConversation(
    userId1: string,
    userId2: string
  ): Promise<any> {
    // Convert string IDs to ObjectId if needed
    const id1 =
      typeof userId1 === "string"
        ? new mongoose.Types.ObjectId(userId1)
        : userId1;
    const id2 =
      typeof userId2 === "string"
        ? new mongoose.Types.ObjectId(userId2)
        : userId2;

    // Sort IDs as strings to ensure consistent ordering
    const participants = [id1, id2].sort((a, b) =>
      a.toString().localeCompare(b.toString())
    );

    // Try to find existing conversation with exactly these two participants
    let conversation = await ConversationModel.findOne({
      participants: { $size: 2, $all: participants },
    });

    // If no conversation exists, create a new one
    if (!conversation) {
      conversation = await ConversationModel.create({
        participants,
      });
    }

    return conversation;
  }

  // Send a message
  static async sendMessage(
    senderId: string,
    recipientId: string,
    text: string,
    attachments: string[] = [] // Assume array of URLs
  ): Promise<any> {
    const conversation = await this.getOrCreateConversation(
      senderId,
      recipientId
    );

    // Create the message first
    const message = await MessageModel.create({
      conversation: conversation._id,
      sender: senderId,
      text,
      attachments,
      status: MessageStatus.SENT,
    });

    // Handle media attachments if any
    if (attachments && attachments.length > 0) {
      const mediaTypes = attachments.map((url: string) =>
        url.endsWith(".mp4") ? "video" : "image"
      );

      const mediaDocs = attachments.map((url: string, index: number) => ({
        user: senderId,
        post: null,
        message: message._id,
        url,
        type: mediaTypes[index],
        targetType: "message" as TargetType,
        targetId: message._id,
      }));

      await MediaModel.insertMany(mediaDocs);
    }

    // Update the conversation's last message
    await ConversationModel.findByIdAndUpdate(conversation._id, {
      lastMessage: message._id,
    });

    return message.populate("sender", "id username firstName lastName avatar");
  }

  // Get messages for a conversation
  static async getMessages(
    conversationId: string,
    page = 1,
    limit = 20
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const messages = await MessageModel.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "id username firstName lastName avatar");

    return messages.reverse(); // Return in chronological order
  }

  // Get all conversations for a user
  static async getConversations(userId: string): Promise<any> {
    const conversations = await ConversationModel.find({
      participants: userId,
    })
      .populate("participants", "id username firstName lastName avatar")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    // Format the conversations to match the Conversation interface
    return conversations.map((conv) => {
      const recipient = conv.participants.find(
        (p) => p._id.toString() !== userId.toString()
      );

      return {
        id: conv._id,
        recipient,
        lastMessage: conv.lastMessage ? conv.lastMessage : "",
        timestamp: conv.updatedAt,
        unread: 0, // This would need to be calculated
        online: false, // This would need to be determined from socket connections
      };
    });
  }

  // Update message status
  static async updateMessageStatus(
    messageId: string,
    status: MessageStatus
  ): Promise<any> {
    return MessageModel.findByIdAndUpdate(messageId, { status }, { new: true });
  }

  // Mark messages as read
  static async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<any> {
    return MessageModel.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        status: { $ne: MessageStatus.READ },
      },
      { status: MessageStatus.READ }
    );
  }
}
