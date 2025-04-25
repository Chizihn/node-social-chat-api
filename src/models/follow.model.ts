import mongoose, { Document, Schema } from "mongoose";

export interface FollowDocument extends Document {
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
}

const followSchema = new Schema<FollowDocument>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

// Ensure users can't follow the same user twice
followSchema.index({ follower: 1, following: 1 }, { unique: true });

const FollowModel = mongoose.model<FollowDocument>("Follow", followSchema);

export default FollowModel;
