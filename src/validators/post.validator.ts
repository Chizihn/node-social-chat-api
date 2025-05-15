import z from "zod";

export class PostValidation {
  // Schema for creating a new post
  static CreatePostSchema = z.object({
    content: z
      .string()
      .min(1, "Post content is required")
      .max(2000, "Post content cannot exceed 2000 characters"),
    tags: z.array(z.string()).optional(),
    media: z
      .array(z.string().url("Each media item must be a valid URL"))
      .optional(),
    location: z.string().optional(),
  });

  // Schema for updating a post
  static UpdatePostSchema = z.object({
    content: z
      .string()
      .min(1, "Post content is required")
      .max(2000, "Post content cannot exceed 2000 characters")
      .optional(),
    tags: z.array(z.string()).optional(),
    media: z
      .array(z.string().url("Each media item must be a valid URL"))
      .optional(),
    location: z.string().optional(),
  });

  // Schema for pagination parameters
  static PaginationSchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  });

  // Schema for post ID parameter
  static PostIdSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID format"),
  });

  // Schema for user ID parameter
  static UserIdSchema = z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
  });

  // Schema for tag search
  static TagSearchSchema = z
    .object({
      tags: z
        .string()
        .min(1, "At least one tag is required")
        .refine((val) => val.split(",").every((tag) => tag.trim().length > 0), {
          message: "Each tag must be non-empty",
        }),
    })
    .merge(PostValidation.PaginationSchema);

  // Schema for like/unlike action
  static LikeActionSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID format"),
  });

  // Schema for trending posts query
  static TrendingPostsSchema = PostValidation.PaginationSchema;

  // Schema for feed query
  static FeedSchema = PostValidation.PaginationSchema;

  // Utility method to validate create post request
  static validateCreatePost(data: unknown) {
    return PostValidation.CreatePostSchema.safeParse(data);
  }

  // Utility method to validate update post request
  static validateUpdatePost(data: unknown) {
    return PostValidation.UpdatePostSchema.safeParse(data);
  }

  // Utility method to validate pagination parameters
  static validatePagination(data: unknown) {
    return PostValidation.PaginationSchema.safeParse(data);
  }

  // Utility method to validate post ID
  static validatePostId(data: unknown) {
    return PostValidation.PostIdSchema.safeParse(data);
  }

  // Utility method to validate user ID
  static validateUserId(data: unknown) {
    return PostValidation.UserIdSchema.safeParse(data);
  }

  // Utility method to validate tag search parameters
  static validateTagSearch(data: unknown) {
    return PostValidation.TagSearchSchema.safeParse(data);
  }

  // Utility method to validate like action parameters
  static validateLikeAction(data: unknown) {
    return PostValidation.LikeActionSchema.safeParse(data);
  }

  // Utility method to validate trending posts query
  static validateTrendingPosts(data: unknown) {
    return PostValidation.TrendingPostsSchema.safeParse(data);
  }

  // Utility method to validate feed query
  static validateFeed(data: unknown) {
    return PostValidation.FeedSchema.safeParse(data);
  }
}
