import mongoose, { Document, Schema } from "mongoose";
import { MessageStatus } from "../types/socket";

export interface IMessage extends Document {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  status: MessageStatus;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

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
      type: [String],
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
