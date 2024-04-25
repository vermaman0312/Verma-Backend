import express from "express";
import {
  getUser,
  getUserFriends,
  addRemoveFriend,
  getUserWithoutFriends,
  getFriendRequestList,
  sendFriendRequest,
  rejectRemoveFriendRequest,
} from "../controllers/users.js";
import { verifyToken } from "./../middleware/auth.js";

const router = express.Router();

// READ //
router.get("/:id", verifyToken, getUser);
router.get("/:id/friends", verifyToken, getUserFriends);
router.get("/", verifyToken, getUserWithoutFriends);

router.post("/getFriendRequestList", verifyToken, getFriendRequestList);
router.post("/sendFriendRequest", verifyToken, sendFriendRequest);
router.post("/rejectRemoveFriendRequest", verifyToken, rejectRemoveFriendRequest);

// UPDATE //
router.patch("/:id/:friendId", verifyToken, addRemoveFriend);

export default router;
