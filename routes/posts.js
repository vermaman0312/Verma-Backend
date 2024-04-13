import express from "express";
import {
  getFeedPosts,
  getUserPosts,
  likePost,
  sendComment,
  getComments,
  sendCommentReply,
  editComment,
  editReplyComment,
  deleteComment,
  deleteReplyComment,
} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// READ //
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);

// UPDATE //
router.patch("/:id/like", verifyToken, likePost);

// POST //
router.post("/sendComment", verifyToken, sendComment);
router.post("/sendCommentReply", verifyToken, sendCommentReply);
router.post("/getComments", verifyToken, getComments);
router.post("/editComment", verifyToken, editComment);
router.post("/editReplyComment", verifyToken, editReplyComment);
router.post("/deleteComment", verifyToken, deleteComment);
router.post("/deleteReplyComment", verifyToken, deleteReplyComment);

export default router;
