import express from "express";
import { login, changePassword, changeUserName } from "../controllers/auth.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/changePassword", verifyToken, changePassword);
router.post("/changeUserName", verifyToken, changeUserName);

export default router;
