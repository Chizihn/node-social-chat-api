import mongoose, { Schema, Types } from "mongoose";
import { FriendDocument } from "../interfaces/friends.interface";
import { FriendshipStatus } from "../enums/user.enum";

const friendSchema: Schema = new Schema<FriendDocument>(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(FriendshipStatus),
      default: FriendshipStatus.PENDING,
    },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret._v;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret._v;
        return ret;
      },
    },
  }
);

// Ensure users can't have duplicate friendship connections
friendSchema.index({ requester: 1, recipient: 1 }, { unique: true });

const FriendModel = mongoose.model<FriendDocument>("Friend", friendSchema);

export default FriendModel;
