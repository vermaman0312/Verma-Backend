import express from "express";
import { sendMessage, getConversations, getMessages } from "../controllers/messageController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyToken, getConversations);
router.post("/sendMessage/:id", verifyToken, sendMessage);
router.post("/getMessage/:id", verifyToken, getMessages);

export default router;
