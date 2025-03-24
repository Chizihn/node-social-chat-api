import mongoose, { Document } from "mongoose";
import { FriendshipStatusType } from "../enums/user.enum";

export interface FriendDocument extends Document {
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: FriendshipStatusType;
  createdAt: Date;
  updatedAt: Date;
}
