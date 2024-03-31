import express from "express";
import { sendMessage, getConversations, getMessages } from "../controllers/messageController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, getConversations);
router.post("/sendMessage/:id", verifyToken, sendMessage);
router.get("/getMessage/:id", verifyToken, getMessages);

export default router;
