import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  addAdminChannel,
  addMemberChannel,
  createChannelLink,
  deleteChannel,
  getAllChannel,
  getAllMyChannel,
  getChannelById,
  getConentListChannel,
  getContentChannel,
  getFollowedChannel,
  joinChannel,
  leaveChannel,
  likeRemoveLikeContent,
  removeAdminChannel,
  removeMember,
  sendContentChannel,
  updateChannel,
} from "../controllers/channel.js";

const router = express.Router();

router.get("/", verifyToken, getAllChannel);
router.get("/getFollowedChannel", verifyToken, getFollowedChannel);
router.get("/getConentListChannel", verifyToken, getConentListChannel);
router.get("/myChannel", verifyToken, getAllMyChannel);
router.post("/getChannelById", verifyToken, getChannelById);
router.post("/deleteChannel", verifyToken, deleteChannel);
router.post("/updateChannel/:channelId", verifyToken, updateChannel);
router.post("/joinChannel", verifyToken, joinChannel);
router.post("/leaveChannel", verifyToken, leaveChannel);
router.post("/addMemberChannel", verifyToken, addMemberChannel);
router.post("/removeMember", verifyToken, removeMember);
router.post("/addAdminChannel", verifyToken, addAdminChannel);
router.post("/removeAdminChannel", verifyToken, removeAdminChannel);
router.post("/sendContentChannel", verifyToken, sendContentChannel);
router.post("/getContentChannel", verifyToken, getContentChannel);
router.post("/likeRemoveLikeContent", verifyToken, likeRemoveLikeContent);
router.post("/createChannelLink", verifyToken, createChannelLink);

export default router;
