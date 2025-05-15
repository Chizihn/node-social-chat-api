import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import messageController from "../controllers/message.controller";
import { asyncAuthHandler } from "../middlewares/async.middleware";

const router = Router();

// Apply auth middleware to all message routes
router.use(authMiddleware);

// Get all conversations for the current user
router.get(
  "/conversations",
  asyncAuthHandler(messageController.getConversations)
);

// Get or create a conversation with another user
router.get(
  "/conversations/:recipientId",
  asyncAuthHandler(messageController.getOrCreateConversation)
);

// Get messages for a specific conversation
router.get("/:conversationId", asyncAuthHandler(messageController.getMessages));

// Send a message
router.post("/", asyncAuthHandler(messageController.sendMessage));

// Delete a message
router.delete("/:messageId", asyncAuthHandler(messageController.deleteMessage));

export default router;
