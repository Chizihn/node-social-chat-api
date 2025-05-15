import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../types/custom.type";
import { HTTPSTATUS } from "../config/http.config";
import { PostService } from "../services/post.service";

class PostController {
  async createPost(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      const post = await PostService.createPost(
        userId,
        req.body,
        req.files as Express.Multer.File[]
      );

      return res.status(HTTPSTATUS.CREATED).json({
        success: true,
        message: "Post created successfully",
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await PostService.getPosts(page, limit);

      return res.status(HTTPSTATUS.OK).json({
        success: true,
        data: result.posts,
        page: result.page,
        totalPages: result.totalPages,
        totalPosts: result.totalPosts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await PostService.getPostById(req.params.postId);

      return res.status(HTTPSTATUS.OK).json({
        success: true,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePost(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      const updatedPost = await PostService.updatePost(
        req.params.postId,
        userId,
        req.body
      );

      return res.status(HTTPSTATUS.OK).json({
        success: true,
        message: "Post updated successfully",
        data: updatedPost,
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      await PostService.deletePost(req.params.postId, userId);

      return res.status(HTTPSTATUS.OK).json({
        success: true,
        message: "Post deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllLikedItems(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      const type = req.query.type as "Post" | "Comment" | undefined;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = parseInt(req.query.skip as string) || 0;

      const formatted = await PostService.getAllLikedItems(
        userId,
        type,
        limit,
        skip
      );

      return res.status(200).json({
        success: true,
        data: formatted,
        pagination: { limit, skip, count: formatted.length },
      });
    } catch (error) {
      next(error);
    }
  }

  async likePost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const result = await PostService.likePost(userId, req.params.postId);

      return res.status(HTTPSTATUS.OK).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async likeComment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      const result = await PostService.likeComment(
        userId,
        req.params.commentId
      );

      return res.status(HTTPSTATUS.OK).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async addComment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      const { content, parentCommentId } = req.body;

      const populatedComment = await PostService.addComment(
        userId,
        req.params.postId,
        content,
        parentCommentId
      );

      return res.status(HTTPSTATUS.CREATED).json({
        success: true,
        message: "Comment added successfully",
        data: populatedComment,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      await PostService.deleteComment(
        userId,
        req.params.id,
        req.params.commentId
      );

      return res.status(HTTPSTATUS.OK).json({
        success: true,
        message: "Comment deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getComments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const comments = await PostService.getComments(req.params.postId);

      return res.status(HTTPSTATUS.OK).json({
        success: true,
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeed(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await PostService.getFeed(userId, page, limit);

      return res.status(200).json({
        success: true,
        data: result.posts,
        page: result.page,
        totalPages: result.totalPages,
        totalPosts: result.totalPosts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserPosts(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const currentUser = req.user?._id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await PostService.getUserPosts(
        req.params.username,
        currentUser,
        page,
        limit
      );

      return res.status(HTTPSTATUS.OK).json({
        success: true,
        data: result.posts,
        page: result.page,
        totalPages: result.totalPages,
        totalPosts: result.totalPosts,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PostController();

// // controllers/post.controller.ts
// import { NextFunction, Request, Response } from "express";

// import mongoose, { Types } from "mongoose";
// import PostModel from "../models/post.model";
// import { AuthenticatedRequest } from "../types/custom.type";
// import LikeModel from "../models/like.model";
// import CommentModel from "../models/comment.model";
// import { HTTPSTATUS } from "../config/http.config";
// import FollowModel from "../models/follow.model";
// import UserModel from "../models/user.model";
// import { FriendshipStatus } from "../enums/user.enum";
// import FriendModel from "../models/friend.model";
// import { PostValidation } from "../validators/post.validator";
// import MediaModel from "../models/media.model";
// import { NotificationService } from "../services/notification.service";
// import { NotificationType } from "../models/notification.model";

// class PostController {
//   // Create a new post
//   async createPost(
//     req: AuthenticatedRequest,
//     res: Response,
//     next: NextFunction
//   ) {
//     const userId = req.user?._id;

//     try {
//       const validatedData = PostValidation.validateCreatePost(req.body);

//       if (!validatedData.success) {
//         return res
//           .status(HTTPSTATUS.BAD_REQUEST)
//           .json({ error: validatedData.error.format() });
//       }

//       let { content, tags, media, location } = validatedData.data;

//       // Handle file uploads if present
//       if (req.files && Array.isArray(req.files)) {
//         // Import the CloudinaryService
//         const { CloudinaryService } = require("../utils/cloudinary");

//         // Upload each file to Cloudinary
//         const uploadPromises = (req.files as Express.Multer.File[]).map(
//           (file) => CloudinaryService.uploadFile(file.path, "posts")
//         );

//         // Wait for all uploads to complete
//         const uploadResults = await Promise.all(uploadPromises);

//         // Get the secure URLs from Cloudinary
//         const mediaUrls = uploadResults.map((result) => result.secure_url);

//         // Add the new media URLs to any existing ones from the request body
//         media = [...(media || []), ...mediaUrls];
//       }

//       const post = new PostModel({
//         content,
//         user: userId,
//         tags: tags || [],
//         media: media || [],
//         location: location || "",
//       });

//       const mediaTypes = media?.map((mediaUrl) => {
//         if (mediaUrl.endsWith(".mp4")) {
//           return "video";
//         }
//         return "image";
//       });

//       if (media && media.length > 0) {
//         const mediaDocs = media.map((item) => ({
//           user: userId,
//           post: post._id,
//           url: media,
//           type: mediaTypes,
//         }));

//         await MediaModel.insertMany(mediaDocs);
//       }

//       await post.save();

//       return res.status(HTTPSTATUS.CREATED).json({
//         success: true,
//         message: "Post created successfully",
//         data: post,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // Get all posts (with pagination)
//   async getPosts(req: Request, res: Response, next: NextFunction) {
//     try {
//       const page = parseInt(req.query.page as string) || 1;
//       const limit = parseInt(req.query.limit as string) || 10;
//       const skip = (page - 1) * limit;

//       const posts = await PostModel.find()
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("user", "id username lastName firstName avatar");

//       const totalPosts = await PostModel.countDocuments();
//       const totalPages = Math.ceil(totalPosts / limit);

//       return res.status(HTTPSTATUS.OK).json({
//         success: true,
//         data: posts,
//         page,
//         totalPages,
//         totalPosts,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // Get a single post by ID
//   async getPostById(req: Request, res: Response, next: NextFunction) {
//     try {
//       const postId = req.params.postId;

//       const post = await PostModel.findById(postId).populate(
//         "user",
//         "id username lastName firstName avatar"
//       );

//       if (!post) {
//         return res.status(HTTPSTATUS.NOT_FOUND).json({
//           success: false,
//           message: "Post not found",
//         });
//       }

//       return res.status(HTTPSTATUS.OK).json({
//         success: true,
//         data: post,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // Update a post
//   async updatePost(
//     req: AuthenticatedRequest,
//     res: Response,
//     next: NextFunction
//   ) {
//     const userId = req.user?._id;
//     try {
//       const postId = req.params.postId;

//       const { content, tags, media, location } = req.body;

//       const post = await PostModel.findById(postId);

//       if (!post) {
//         return res.status(404).json({
//           success: false,
//           message: "Post not found",
//         });
//       }

//       // Check if the user is the owner of the post
//       if (post.user.toString() !== userId.toString()) {
//         return res.status(403).json({
//           success: false,
//           message: "Unauthorized: You can only update your own posts",
//         });
//       }

//       const updatedPost = await PostModel.findByIdAndUpdate(
//         postId,
//         {
//           content: content || post.content,
//           tags: tags || post.tags,
//           media: media || post.media,
//           location: location || post.location,
//         },
//         { new: true }
//       ).populate("user", "username name avatar");

//       return res.status(HTTPSTATUS.OK).json({
//         success: true,
//         message: "Post updated successfully",
//         data: updatedPost,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // Delete a post
//   async deletePost(
//     req: AuthenticatedRequest,
//     res: Response,
//     next: NextFunction
//   ) {
//     const userId = req.user?._id;

//     try {
//       const postId = req.params.postId;

//       const post = await PostModel.findById(postId);

//       if (!post) {
//         return res.status(404).json({
//           success: false,
//           message: "Post not found",
//         });
//       }

//       // Check if the user is the owner of the post
//       if (post.user.toString() !== userId.toString()) {
//         return res.status(403).json({
//           success: false,
//           message: "Unauthorized: You can only delete your own posts",
//         });
//       }

//       // Delete the post and all associated likes
//       const session = await mongoose.startSession();
//       session.startTransaction();

//       try {
//         // Delete post
//         await PostModel.findByIdAndDelete(postId).session(session);

//         // Delete associated likes
//         await LikeModel.deleteMany({ post: postId }).session(session);

//         // Delete associated comments and their likes
//         const comments = await CommentModel.find({ post: postId });
//         const commentIds = comments.map((comment) => comment._id);

//         await CommentModel.deleteMany({ post: postId }).session(session);
//         await LikeModel.deleteMany({ comment: { $in: commentIds } }).session(
//           session
//         );

//         await session.commitTransaction();
//       } catch (error) {
//         await session.abortTransaction();
//         throw error;
//       } finally {
//         session.endSession();
//       }

//       return res.status(HTTPSTATUS.OK).json({
//         success: true,
//         message: "Post deleted successfully",
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   async getAllLikedItems(
//     req: AuthenticatedRequest,
//     res: Response,
//     next: NextFunction
//   ) {
//     const userId = req.user?._id;
//     const type = req.query.type as "Post" | "Comment" | undefined;
//     const limit = parseInt(req.query.limit as string) || 10;
//     const skip = parseInt(req.query.skip as string) || 0;

//     try {
//       const filter: any = { user: userId };
//       if (type) filter.targetType = type;

//       const likes = await LikeModel.find(filter)
//         .sort({ createdAt: -1 })
//         .limit(limit)
//         .skip(skip)
//         .select("_id targetId targetType createdAt");

//       const formatted = likes.map((like) => ({
//         _id: like._id,
//         targetId: like.targetId,
//         type: like.targetType,
//         likedAt: like.createdAt,
//       }));

//       return res.status(200).json({
//         success: true,
//         data: formatted,
//         pagination: {
//           limit,
//           skip,
//           count: formatted.length,
//         },
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // Like or unlike a post
//   // async likePost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
//   //   const userId = req.user?._id;
//   //   try {
//   //     const postId = req.params.postId;

//   //     // Check if post exists
//   //     const post = await PostModel.findById(postId);
//   //     if (!post) {
//   //       return res.status(HTTPSTATUS.NOT_FOUND).json({
//   //         success: false,
//   //         message: "Post not found",
//   //       });
//   //     }

//   //     // Check if user already liked the post
//   //     const existingLike = await PostLikeModel.findOne({
//   //       user: userId,
//   //       post: postId,
//   //     });

//   //     if (existingLike) {
//   //       // User already liked the post, so unlike it
//   //       await PostLikeModel.findByIdAndDelete(existingLike._id);

//   //       // Decrement post likes count
//   //       await PostModel.findByIdAndUpdate(postId, { $inc: { likes: -1 } });

//   //       return res.status(HTTPSTATUS.OK).json({
//   //         success: true,
//   //         message: "Post unliked successfully",
//   //       });
//   //     } else {
//   //       // User hasn't liked the post yet, so like it
//   //       const newLike = new PostLikeModel({
//   //         user: userId,
//   //         post: postId,
//   //       });

//   //       await newLike.save();

//   //       // Increment post likes count
//   //       await PostModel.findByIdAndUpdate(postId, { $inc: { likes: 1 } });

//   //       return res.status(HTTPSTATUS.OK).json({
//   //         success: true,
//   //         message: "Post liked successfully",
//   //       });
//   //     }
//   //   } catch (error) {
//   //     next(error);
//   //   }
//   // }

//   async likePost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
//     const userId = req.user?._id;
//     const postId = req.params.postId;

//     try {
//       const post = await PostModel.findById(postId);
//       if (!post) {
//         return res.status(HTTPSTATUS.NOT_FOUND).json({
//           success: false,
//           message: "Post not found",
//         });
//       }

//       const existingLike = await LikeModel.findOne({
//         user: userId,
//         targetId: postId,
//         targetType: "Post",
//       });

//       if (existingLike) {
//         await LikeModel.findByIdAndDelete(existingLike._id);
//         await PostModel.findByIdAndUpdate(postId, { $inc: { likes: -1 } });

//         return res.status(HTTPSTATUS.OK).json({
//           success: true,
//           message: "Post unliked successfully",
//         });
//       } else {
//         await LikeModel.create({
//           user: userId,
//           targetId: postId,
//           targetType: "Post",
//         });

//         await PostModel.findByIdAndUpdate(postId, { $inc: { likes: 1 } });

//         return res.status(HTTPSTATUS.OK).json({
//           success: true,
//           message: "Post liked successfully",
//         });
//       }
//     } catch (error) {
//       next(error);
//     }
//   }

//   // Like/Unlike a comment
//   async likeComment(
//     req: AuthenticatedRequest,
//     res: Response,
//     next: NextFunction
//   ) {
//     const userId = req.user?._id;
//     const commentId = req.params.commentId;

//     try {
//       const comment = await CommentModel.findById(commentId);
//       if (!comment) {
//         return res.status(HTTPSTATUS.NOT_FOUND).json({
//           success: false,
//           message: "Comment not found",
//         });
//       }

//       const existingLike = await LikeModel.findOne({
//         user: userId,
//         targetId: commentId,
//         targetType: "Comment",
//       });

//       if (existingLike) {
//         await LikeModel.findByIdAndDelete(existingLike._id);
//         await CommentModel.findByIdAndUpdate(commentId, {
//           $inc: { likes: -1 },
//         });

//         return res.status(HTTPSTATUS.OK).json({
//           success: true,
//           message: "Comment unliked successfully",
//         });
//       } else {
//         await LikeModel.create({
//           user: userId,
//           targetId: commentId,
//           targetType: "Comment",
//         });

//         await CommentModel.findByIdAndUpdate(commentId, { $inc: { likes: 1 } });

//         return res.status(HTTPSTATUS.OK).json({
//           success: true,
//           message: "Comment liked successfully",
//         });
//       }
//     } catch (error) {
//       next(error);
//     }
//   }

//   // Add comment to a post
//   async addComment(
//     req: AuthenticatedRequest,
//     res: Response,
//     next: NextFunction
//   ) {
//     const userId = req.user?._id;

//     try {
//       const postId = req.params.postId;
//       const { content, parentCommentId } = req.body;

//       const parentCommentObjectId = new Types.ObjectId(parentCommentId);

//       if (!content?.trim()) {
//         return res.status(HTTPSTATUS.BAD_REQUEST).json({
//           success: false,
//           message: "Comment content is required",
//         });
//       }

//       const post = await PostModel.findById(postId);
//       if (!post) {
//         return res.status(HTTPSTATUS.NOT_FOUND).json({
//           success: false,
//           message: "Post not found",
//         });
//       }

//       // Optionally validate parentCommentId
//       if (parentCommentId) {
//         const parentExists = await CommentModel.exists({
//           _id: parentCommentObjectId,
//         });
//         if (!parentExists) {
//           return res.status(HTTPSTATUS.BAD_REQUEST).json({
//             success: false,
//             message: "Parent comment not found",
//           });
//         }
//       }

//       const newComment = new CommentModel({
//         content,
//         user: userId,
//         post: postId,
//         parentComment: parentCommentId || null,
//       });

//       await newComment.save();

//       await PostModel.findByIdAndUpdate(postId, { $inc: { comments: 1 } });

//       if (post.user.toString() !== userId) {
//         const user = await UserModel.findById(userId);
//         const notificationContent = `${
//           user?.firstName || user?.username
//         } commented on your post`;

//         await NotificationService.createNotification(
//           post.user.toString(),
//           userId,
//           NotificationType.POST_COMMENT,
//           notificationContent,
//           postId,
//           "Post"
//         );
//       }

//       const populatedComment = await CommentModel.findById(
//         newComment._id
//       ).populate("user", "username firstName lastName avatar");

//       return res.status(HTTPSTATUS.CREATED).json({
//         success: true,
//         message: "Comment added successfully",
//         data: populatedComment,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // Delete a comment
//   async deleteComment(
//     req: AuthenticatedRequest,
//     res: Response,
//     next: NextFunction
//   ) {
//     const userId = req.user?._id;
//     try {
//       const { id: postId, commentId } = req.params;

//       // Check if post exists
//       const post = await PostModel.findById(postId);
//       if (!post) {
//         return res.status(HTTPSTATUS.NOT_FOUND).json({
//           success: false,
//           message: "Post not found",
//         });
//       }

//       // Check if comment exists
//       const comment = await CommentModel.findById(commentId);
//       if (!comment) {
//         return res.status(HTTPSTATUS.NOT_FOUND).json({
//           success: false,
//           message: "Comment not found",
//         });
//       }

//       // Check if user is authorized to delete the comment
//       // Allow if user is comment owner or post owner
//       if (
//         comment.user.toString() !== userId.toString() &&
//         post.user.toString() !== userId.toString()
//       ) {
//         return res.status(HTTPSTATUS.FORBIDDEN).json({
//           success: false,
//           message:
//             "Unauthorized: You can only delete your own comments or comments on your posts",
//         });
//       }

//       // Start a transaction to delete comment and associated likes
//       const session = await mongoose.startSession();
//       session.startTransaction();

//       try {
//         // Delete comment
//         await CommentModel.findByIdAndDelete(commentId).session(session);

//         // Delete associated likes
//         await LikeModel.deleteMany({ comment: commentId }).session(session);

//         // Decrement post comments count
//         await PostModel.findByIdAndUpdate(postId, {
//           $inc: { comments: -1 },
//         }).session(session);

//         await session.commitTransaction();
//       } catch (error) {
//         await session.abortTransaction();
//         throw error;
//       } finally {
//         session.endSession();
//       }

//       return res.status(HTTPSTATUS.OK).json({
//         success: true,
//         message: "Comment deleted successfully",
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // Get comments for a post
//   async getComments(
//     req: AuthenticatedRequest,
//     res: Response,
//     next: NextFunction
//   ) {
//     const { postId } = req.params;

//     try {
//       // Check if post exists (optional but safe)
//       const post = await PostModel.findById(postId);
//       if (!post) {
//         return res.status(HTTPSTATUS.NOT_FOUND).json({
//           success: false,
//           message: "Post not found",
//         });
//       }

//       // Fetch comments
//       const comments = await CommentModel.find({ post: postId })
//         .sort({ createdAt: -1 }) // newest first
//         .populate("user", "id username firstName lastName avatar");

//       return res.status(HTTPSTATUS.OK).json({
//         success: true,
//         data: comments,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // Get posts from followed users (feed)
//   async getFeed(req: AuthenticatedRequest, res: Response, next: NextFunction) {
//     const userId = req.user?._id;
//     try {
//       const page = parseInt(req.query.page as string) || 1;
//       const limit = parseInt(req.query.limit as string) || 10;
//       const skip = (page - 1) * limit;

//       // Get IDs of users that the current user follows
//       const followedUsers = await FollowModel.find({ follower: userId }).select(
//         "following"
//       );
//       const followedUserIds = followedUsers.map((follow) => follow.following);

//       // Include user's own posts in the feed
//       followedUserIds.push(userId);

//       // Get posts from followed users and own posts
//       const posts = await PostModel.find({ user: { $in: followedUserIds } })
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("user", "id username firstName lastName avatar");

//       const totalPosts = await PostModel.countDocuments({
//         user: { $in: followedUserIds },
//       });
//       const totalPages = Math.ceil(totalPosts / limit);

//       return res.status(200).json({
//         success: true,
//         data: posts,
//         page,
//         totalPages,
//         totalPosts,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // Get posts by a specific user
//   async getUserPosts(
//     req: AuthenticatedRequest,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {
//       const username = req.params.username;
//       const currentUser = req.user?._id;
//       const page = parseInt(req.query.page as string) || 1;
//       const limit = parseInt(req.query.limit as string) || 10;
//       const skip = (page - 1) * limit;

//       const user = await UserModel.findOne({ username });
//       if (!user) {
//         return res.status(HTTPSTATUS.NOT_FOUND).json({
//           success: false,
//           message: "User not found",
//         });
//       }

//       const userId = new Types.ObjectId(user.id);

//       // Check privacy & friendship
//       if (user.isPrivate && !userId.equals(currentUser)) {
//         const friendship = await FriendModel.findOne({
//           $or: [
//             { requester: currentUser, recipient: user._id },
//             { requester: user._id, recipient: currentUser },
//           ],
//         });

//         if (!friendship || friendship.status !== FriendshipStatus.ACCEPTED) {
//           return res.status(403).json({
//             success: false,
//             message:
//               "This account is private. You need to be friends to view posts.",
//           });
//         }
//       }

//       // Get posts by user _id
//       const posts = await PostModel.find({ user: user._id })
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("user", "id username firstName lastName avatar");

//       const totalPosts = await PostModel.countDocuments({ user: user._id });
//       const totalPages = Math.ceil(totalPosts / limit);

//       return res.status(HTTPSTATUS.OK).json({
//         success: true,
//         data: posts,
//         page,
//         totalPages,
//         totalPosts,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // Search posts by tags
//   async searchPostsByTags(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { tags } = req.query;
//       const page = parseInt(req.query.page as string) || 1;
//       const limit = parseInt(req.query.limit as string) || 10;
//       const skip = (page - 1) * limit;

//       if (!tags) {
//         return res.status(HTTPSTATUS.BAD_REQUEST).json({
//           success: false,
//           message: "Tags parameter is required for search",
//         });
//       }

//       const tagsArray = (tags as string).split(",").map((tag) => tag.trim());

//       const posts = await PostModel.find({ tags: { $in: tagsArray } })
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("user", "username name avatar");

//       const totalPosts = await PostModel.countDocuments({
//         tags: { $in: tagsArray },
//       });
//       const totalPages = Math.ceil(totalPosts / limit);

//       return res.status(HTTPSTATUS.OK).json({
//         success: true,
//         data: posts,
//         page,
//         totalPages,
//         totalPosts,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // Get trending posts (based on likes and recent activity)
//   async getTrendingPosts(req: Request, res: Response, next: NextFunction) {
//     try {
//       const page = parseInt(req.query.page as string) || 1;
//       const limit = parseInt(req.query.limit as string) || 10;
//       const skip = (page - 1) * limit;

//       // Calculate post age in hours
//       const currentTime = new Date();

//       // Get posts from the last 7 days
//       const posts = await PostModel.find({
//         createdAt: {
//           $gte: new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000),
//         },
//       })
//         .populate("user", "username name avatar")
//         .lean();

//       // Calculate trending score: (likes + comments + shares) / age^1.5
//       const postsWithScore = posts.map((post) => {
//         const ageInHours =
//           (currentTime.getTime() - new Date(post.createdAt).getTime()) /
//           (1000 * 60 * 60);
//         const denominator = Math.pow(ageInHours + 2, 1.5); // Adding 2 to avoid division by very small numbers
//         const score = (post.likes + post.comments + post.shares) / denominator;

//         return {
//           ...post,
//           trendingScore: score,
//         };
//       });

//       // Sort by trending score
//       postsWithScore.sort((a, b) => b.trendingScore - a.trendingScore);

//       // Apply pagination
//       const paginatedPosts = postsWithScore.slice(skip, skip + limit);

//       return res.status(200).json({
//         success: true,
//         data: paginatedPosts,
//         page,
//         totalPages: Math.ceil(postsWithScore.length / limit),
//         totalPosts: postsWithScore.length,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // async deleteMedia(req: AuthenticatedRequest, res: Response, next: NextFunction) {
//   //   try {
//   //     const mediaId = req.params.id;
//   //     const media = await MediaModel.findById(mediaId);
//   //     if (!media) {
//   //       return res.status(404).json({ success: false, message: 'Media not found' });
//   //     }

//   //     // Optional: check if user is owner
//   //     if (!media.user.equals(req.user._id)) {
//   //       return res.status(403).json({ success: false, message: 'Unauthorized' });
//   //     }

//   //     // Extract public_id from URL
//   //     const publicId = extractPublicId(media.url);

//   //     // Delete from Cloudinary
//   //     await cloudinary.uploader.destroy(publicId, {
//   //       resource_type: media.type === 'video' ? 'video' : 'image',
//   //     });

//   //     // Delete from DB
//   //     await media.deleteOne();

//   //     return res.status(200).json({ success: true, message: 'Media deleted' });
//   //   } catch (error) {
//   //     next(error);
//   //   }
//   // }

//   // async deletePostWithMedia(
//   //   req: AuthenticatedRequest,
//   //   res: Response,
//   //   next: NextFunction
//   // ) {
//   //   try {
//   //     const postId = req.params.id;
//   //     const userId = req.user._id;

//   //     // Find post
//   //     const post = await PostModel.findById(postId);
//   //     if (!post) {
//   //       return res.status(404).json({ success: false, message: 'Post not found' });
//   //     }

//   //     // Optional: ensure only the owner can delete
//   //     if (!post.user.equals(userId)) {
//   //       return res.status(403).json({ success: false, message: 'Unauthorized' });
//   //     }

//   //     // Find media linked to the post
//   //     const mediaList = await MediaModel.find({ post: postId });

//   //     // Extract public IDs and delete from Cloudinary
//   //     for (const media of mediaList) {
//   //       const publicId = extractPublicId(media.url); // we'll define this below
//   //       await cloudinary.uploader.destroy(publicId, {
//   //         resource_type: media.type === 'video' ? 'video' : 'image',
//   //       });
//   //     }

//   //     // Delete media documents from DB
//   //     await MediaModel.deleteMany({ post: postId });

//   //     // Delete the post
//   //     await post.deleteOne();

//   //     return res.status(200).json({
//   //       success: true,
//   //       message: 'Post and all media deleted',
//   //     });
//   //   } catch (error) {
//   //     next(error);
//   //   }
//   // }
// }

// export default new PostController();
