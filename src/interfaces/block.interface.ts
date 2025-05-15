import { Document, Types } from "mongoose";

export interface IBlock extends Document {
  blocker: Types.ObjectId;
  blocked: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
