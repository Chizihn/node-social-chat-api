import { NotificationService } from "../services/notification.service";
import { NotificationType } from "../models/notification.model";
import UserModel from "../models/user.model";

export class MentionUtils {
  // Extract mentions from text (usernames prefixed with @)
  static extractMentions(text: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]); // Extract the username without the @ symbol
    }

    return mentions;
  }

  // Process mentions and create notifications
  static async processMentions(
    text: string,
    authorId: string,
    entityId: string,
    entityType: string,
    contentType: "post" | "comment"
  ): Promise<void> {
    const mentions = this.extractMentions(text);

    if (mentions.length === 0) return;

    // Get the author details
    const author = await UserModel.findById(authorId);

    // Find users by username and create notifications
    for (const username of mentions) {
      const mentionedUser = await UserModel.findOne({ username });

      if (mentionedUser && mentionedUser._id?.toString() !== authorId) {
        const notificationContent = `${
          author?.firstName || author?.username
        } mentioned you in a ${contentType}`;

        await NotificationService.createNotification(
          String(mentionedUser._id).toString(),
          authorId,
          NotificationType.MENTION,
          notificationContent,
          entityId,
          entityType
        );
      }
    }
  }
}
