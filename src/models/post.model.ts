import mongoose, { Document, Schema } from "mongoose";

export interface PostDocument extends Document {
  content: string;
  user: mongoose.Types.ObjectId;
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
  media: string[];
  location: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<PostDocument>(
  {
    content: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    media: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
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

const PostModel = mongoose.model<PostDocument>("Post", postSchema);

export default PostModel;
