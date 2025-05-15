import mongoose, { Schema, Document } from "mongoose";

export enum NotificationType {
  NEW_FOLLOWER = "new_follower",
  FRIEND_REQUEST = "friend_request",
  FRIEND_ACCEPT = "friend_accept",
  NEW_MESSAGE = "new_message",
  POST_LIKE = "post_like",
  POST_COMMENT = "post_comment",
  COMMENT_LIKE = "comment_like",
  MENTION = "mention",
}

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: NotificationType;
  read: boolean;
  content: string;
  entityId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "entityModel",
    },
    entityModel: {
      type: String,
      enum: ["Post", "Comment", "Message", "User"],
    },
  },
  {
    timestamps: true,
  }
);

export const NotificationModel = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
