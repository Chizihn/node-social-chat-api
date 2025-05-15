import mongoose, { Document, Schema } from "mongoose";
import { MessageStatus } from "../types/socket";

export interface IAttachment {
  name: string;
  type: string;
  url: string;
}

export interface IMessage extends Document {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  status: MessageStatus;
  attachments: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String, required: true },
});

const MessageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: Object.values(MessageStatus),
      default: MessageStatus.SENT,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id, delete ret._v;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id, delete ret._v;
        return ret;
      },
    },
  }
);

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);
