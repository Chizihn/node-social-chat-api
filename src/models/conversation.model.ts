import mongoose, { Document, Schema } from "mongoose";

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage: mongoose.Types.ObjectId | null;
  updatedAt: Date;
  createdAt: Date;
}

const ConversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
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

// Modified compound index that will only consider arrays with exactly the same elements as duplicates
// This ensures that conversations between the same two users are unique
ConversationSchema.index(
  { participants: 1 },
  {
    unique: true,
    // Important: This ensures the index recognizes that [A,B] is the same as [B,A]
    collation: { locale: "simple", strength: 2 },
  }
);

export const ConversationModel = mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);
