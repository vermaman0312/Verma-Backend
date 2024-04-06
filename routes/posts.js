import express from "express";
import { getFeedPosts, getUserPosts, likePost, sendComment, getComments } from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// READ //
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);

// UPDATE //
router.patch("/:id/like", verifyToken, likePost);

// POST //
router.post("/sendComment", verifyToken, sendComment);
router.post("/getComments", verifyToken, getComments);


export default router;
