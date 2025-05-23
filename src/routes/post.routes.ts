import { Router } from "express";

import { authMiddleware } from "../middlewares/auth.middleware";
import postController from "../controllers/post.controller";
import { asyncAuthHandler } from "../middlewares/async.middleware";
const postRoutes = Router();

// Public routes (though still using authMiddleware — maybe rename?)
postRoutes.get(
  "/posts",
  authMiddleware,
  asyncAuthHandler(postController.getPosts)
);

postRoutes.get(
  "/posts/user/:username",
  authMiddleware,
  asyncAuthHandler(postController.getUserPosts)
);

postRoutes.get(
  "/posts/feed",
  authMiddleware,
  asyncAuthHandler(postController.getFeed)
);

// Protected routes
postRoutes.post(
  "/posts",
  authMiddleware,
  asyncAuthHandler(postController.createPost)
);
// postRoutes.get(
//   "/user/posts",
//   authMiddleware,
//   asyncAuthHandler(postController.getUserPosts)
// );
postRoutes.get(
  "/posts/:postId",
  authMiddleware,
  asyncAuthHandler(postController.getPostById)
);
postRoutes.put(
  "/posts/:postId",
  authMiddleware,
  asyncAuthHandler(postController.updatePost)
);
postRoutes.delete(
  "/posts/:postId",
  authMiddleware,
  asyncAuthHandler(postController.deletePost)
);

postRoutes.get(
  "/likes",
  authMiddleware,
  asyncAuthHandler(postController.getAllLikedItems)
);

postRoutes.post(
  "/posts/:postId/like",
  authMiddleware,
  asyncAuthHandler(postController.likePost)
);
postRoutes.get(
  "/comments/:postId",
  authMiddleware,
  asyncAuthHandler(postController.getComments)
);
postRoutes.post(
  "/comments/:postId",
  authMiddleware,
  asyncAuthHandler(postController.addComment)
);
postRoutes.delete(
  "/:postId/comments/:commentId",
  authMiddleware,
  asyncAuthHandler(postController.deleteComment)
);

postRoutes.post(
  "/comments/:commentId/like",
  authMiddleware,
  asyncAuthHandler(postController.likeComment)
);

export default postRoutes;
