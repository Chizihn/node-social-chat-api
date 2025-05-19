import mongoose, { Document, Schema, Types, Model } from "mongoose";

// Define the types of targets a media file can belong to
export type TargetType = "post" | "comment" | "message";

// Define the TS interface for a media document
export interface MediaDocument extends Document {
  user: Types.ObjectId;
  targetId: Types.ObjectId;
  targetType: TargetType;
  url: string;
  type: "image" | "video";
  createdAt: Date;
}

// Define the schema
const mediaSchema = new Schema<MediaDocument>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },

  // This can be a post ID or a comment ID depending on the targetType
  targetId: { type: Schema.Types.ObjectId, required: true },

  targetType: {
    type: String,
    enum: ["post", "comment"],
    required: true,
  },

  url: { type: String, required: true },

  type: {
    type: String,
    enum: ["image", "video"],
    required: true,
  },

  createdAt: { type: Date, default: Date.now },
});

// Create a typed model
const MediaModel: Model<MediaDocument> = mongoose.model<MediaDocument>(
  "Media",
  mediaSchema
);

export default MediaModel;
