import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { getMessages, getParticipant, sendMessage } from "../controllers/communication.js";

const router = express.Router();

router.post("/sendMessage", verifyToken, sendMessage);
router.post("/getParticipant", verifyToken, getParticipant);
router.post("/getMessages", verifyToken, getMessages);

export default router;
