import express from "express";
import rateLimit from "express-rate-limit";
import auth from "../middleware/auth.js";
import {
  createComment,
  approveComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

// Rate limiter for creating comments
const commentLimiter = rateLimit({ windowMs: 60 * 1000, max: 6 });

// Public route: create comment
router.post("/:postId", commentLimiter, createComment);

// Protected routes
router.patch("/:id/approve", auth, approveComment);
router.delete("/:id", auth, deleteComment);

export default router;
