import mongoose, { Schema, model } from "mongoose";
import { IBlock } from "../interfaces/block.interface";

const BlockSchema = new Schema<IBlock>(
  {
    blocker: { type: Schema.Types.ObjectId, ref: "User", required: true },
    blocked: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Prevent duplicate blocks
BlockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

const BlockModel = model<IBlock>("Block", BlockSchema);

export default BlockModel;
