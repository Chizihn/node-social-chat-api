import mongoose, { Document, Schema } from "mongoose";

export interface LikeDocument extends Document {
  user: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId; // ID of either post or comment
  targetType: "Post" | "Comment"; // Type of the target
  createdAt: Date;
  updatedAt: Date;
}

const likeSchema = new Schema<LikeDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      enum: ["Post", "Comment"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index to ensure a user can't like the same item twice
likeSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true });

const LikeModel = mongoose.model<LikeDocument>("Like", likeSchema);
export default LikeModel;
// // models/PostLike.ts
// import mongoose, { Document, Schema } from "mongoose";

// export interface PostLikeDocument extends Document {
//   user: mongoose.Types.ObjectId;
//   post: mongoose.Types.ObjectId;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const postLikeSchema = new Schema<PostLikeDocument>(
//   {
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     post: {
//       type: Schema.Types.ObjectId,
//       ref: "Post",
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Create a compound index to ensure a user can't like the same post twice
// postLikeSchema.index({ user: 1, post: 1 }, { unique: true });

// const PostLikeModel = mongoose.model<PostLikeDocument>(
//   "PostLike",
//   postLikeSchema
// );
// export default PostLikeModel;
