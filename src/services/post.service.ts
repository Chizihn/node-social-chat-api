import mongoose, { Types } from "mongoose";
import PostModel from "../models/post.model";
import LikeModel from "../models/like.model";
import CommentModel from "../models/comment.model";
import UserModel from "../models/user.model";
import FriendModel from "../models/friend.model";
import FollowModel from "../models/follow.model";
import MediaModel from "../models/media.model";
import { FriendshipStatus } from "../enums/user.enum";
import { NotificationService } from "./notification.service";
import { NotificationType } from "../models/notification.model";
import { PostValidation } from "../validators/post.validator";
import { z } from "zod";

export class PostService {
  static async createPost(
    userId: string,
    validatedData: z.infer<typeof PostValidation.CreatePostSchema>
  ) {
    try {
      const { content, tags, media, location } = validatedData;

      const post = new PostModel({
        content,
        user: userId,
        tags: tags || [],
        media: media || [],
        location: location || "",
      });

      // Save the post first to get its ID
      await post.save();

      if (media && media.length > 0) {
        const mediaTypes = media.map((mediaUrl: string) =>
          mediaUrl.endsWith(".mp4") ? "video" : "image"
        );

        const mediaDocs = media.map((url: string, index: number) => ({
          user: userId,
          post: post._id,
          url: url,
          type: mediaTypes[index],
          targetType: "post",
          targetId: post._id, // Add the required targetId field
        }));

        await MediaModel.insertMany(mediaDocs);
      }

      return post;
    } catch (error) {
      throw error;
    }
  }

  static async getPosts(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "id username lastName firstName avatar");

    const totalPosts = await PostModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);

    return { posts, totalPosts, totalPages, page };
  }

  static async getPostById(postId: string) {
    const post = await PostModel.findById(postId).populate(
      "user",
      "id username lastName firstName avatar"
    );
    if (!post) {
      throw new Error("Post not found");
    }
    return post;
  }

  static async updatePost(postId: string, userId: string, updateData: any) {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.user.toString() !== userId.toString()) {
      throw new Error("Unauthorized: You can only update your own posts");
    }

    const { content, tags, media, location } = updateData;
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      {
        content: content || post.content,
        tags: tags || post.tags,
        media: media || post.media,
        location: location || post.location,
      },
      { new: true }
    ).populate("user", "username name avatar");

    return updatedPost;
  }

  static async deletePost(postId: string, userId: string) {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.user.toString() !== userId.toString()) {
      throw new Error("Unauthorized: You can only delete your own posts");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await PostModel.findByIdAndDelete(postId).session(session);
      await LikeModel.deleteMany({ post: postId }).session(session);

      const comments = await CommentModel.find({ post: postId });
      const commentIds = comments.map((comment) => comment._id);

      await CommentModel.deleteMany({ post: postId }).session(session);
      await LikeModel.deleteMany({ comment: { $in: commentIds } }).session(
        session
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getAllLikedItems(
    userId: string,
    type?: "Post" | "Comment",
    limit: number = 10,
    skip: number = 0
  ) {
    const filter: any = { user: userId };
    if (type) filter.targetType = type;

    const likes = await LikeModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select("_id targetId targetType createdAt");

    return likes.map((like) => ({
      _id: like._id,
      targetId: like.targetId,
      type: like.targetType,
      likedAt: like.createdAt,
    }));
  }

  static async likePost(userId: string, postId: string) {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const existingLike = await LikeModel.findOne({
      user: userId,
      targetId: postId,
      targetType: "Post",
    });

    if (existingLike) {
      await LikeModel.findByIdAndDelete(existingLike._id);
      await PostModel.findByIdAndUpdate(postId, { $inc: { likes: -1 } });
      return { message: "Post unliked successfully" };
    } else {
      await LikeModel.create({
        user: userId,
        targetId: postId,
        targetType: "Post",
      });
      await PostModel.findByIdAndUpdate(postId, { $inc: { likes: 1 } });
      return { message: "Post liked successfully" };
    }
  }

  static async likeComment(userId: string, commentId: string) {
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    const existingLike = await LikeModel.findOne({
      user: userId,
      targetId: commentId,
      targetType: "Comment",
    });

    if (existingLike) {
      await LikeModel.findByIdAndDelete(existingLike._id);
      await CommentModel.findByIdAndUpdate(commentId, { $inc: { likes: -1 } });
      return { message: "Comment unliked successfully" };
    } else {
      await LikeModel.create({
        user: userId,
        targetId: commentId,
        targetType: "Comment",
      });
      await CommentModel.findByIdAndUpdate(commentId, { $inc: { likes: 1 } });
      return { message: "Comment liked successfully" };
    }
  }

  static async addComment(
    userId: string,
    postId: string,
    content: string,
    parentCommentId?: string
  ) {
    if (!content?.trim()) {
      throw new Error("Comment content is required");
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (parentCommentId) {
      const parentExists = await CommentModel.exists({
        _id: new Types.ObjectId(parentCommentId),
      });
      if (!parentExists) {
        throw new Error("Parent comment not found");
      }
    }

    const newComment = new CommentModel({
      content,
      user: userId,
      post: postId,
      parentComment: parentCommentId || null,
    });

    await newComment.save();
    await PostModel.findByIdAndUpdate(postId, { $inc: { comments: 1 } });

    if (post.user.toString() !== userId) {
      const user = await UserModel.findById(userId);
      const notificationContent = `${
        user?.firstName || user?.username
      } commented on your post`;

      await NotificationService.createNotification(
        post.user.toString(),
        userId,
        NotificationType.POST_COMMENT,
        notificationContent,
        postId,
        "Post"
      );
    }

    return CommentModel.findById(newComment._id).populate(
      "user",
      "username firstName lastName avatar"
    );
  }

  static async deleteComment(
    userId: string,
    postId: string,
    commentId: string
  ) {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (
      comment.user.toString() !== userId.toString() &&
      post.user.toString() !== userId.toString()
    ) {
      throw new Error(
        "Unauthorized: You can only delete your own comments or comments on your posts"
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await CommentModel.findByIdAndDelete(commentId).session(session);
      await LikeModel.deleteMany({ comment: commentId }).session(session);
      await PostModel.findByIdAndUpdate(postId, {
        $inc: { comments: -1 },
      }).session(session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getComments(postId: string) {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    return CommentModel.find({ post: postId })
      .sort({ createdAt: -1 })
      .populate("user", "id username firstName lastName avatar");
  }

  static async getFeed(userId: string, page: number = 1, limit: number = 10) {
    const userObjectId = new Types.ObjectId(userId);
    const skip = (page - 1) * limit;

    const followedUsers = await FollowModel.find({ follower: userId }).select(
      "following"
    );
    const followedUserIds = followedUsers.map((follow) => follow.following);
    followedUserIds.push(userObjectId);

    const posts = await PostModel.find({ user: { $in: followedUserIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "id username firstName lastName avatar");

    const totalPosts = await PostModel.countDocuments({
      user: { $in: followedUserIds },
    });
    const totalPages = Math.ceil(totalPosts / limit);

    return { posts, totalPosts, totalPages, page };
  }

  static async getUserPosts(
    username: string,
    currentUserId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const user = await UserModel.findOne({ username });
    if (!user) {
      throw new Error("User not found");
    }

    const userId = new Types.ObjectId(user.id);

    if (user.isPrivate && !userId.equals(currentUserId)) {
      const friendship = await FriendModel.findOne({
        $or: [
          { requester: currentUserId, recipient: user._id },
          { requester: user._id, recipient: currentUserId },
        ],
      });

      if (!friendship || friendship.status !== FriendshipStatus.ACCEPTED) {
        throw new Error(
          "This account is private. You need to be friends to view posts."
        );
      }
    }

    const posts = await PostModel.find({ user: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "id username firstName lastName avatar");

    const totalPosts = await PostModel.countDocuments({ user: user._id });
    const totalPages = Math.ceil(totalPosts / limit);

    return { posts, totalPosts, totalPages, page };
  }
}
