import { decodeToken } from "../middleware/auth.js";
import Communication from "../models/Communication.js";
import User from "../models/User.js";

// Send Message //
export const sendMessage = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader && authorizationHeader.split(" ")[1];
    if (!token) {
      return res.json({ Message: "Token not found" });
    }
    const userDetail = await decodeToken(token);
    if (!userDetail) {
      return res.json({ Message: "Invalid Token" });
    }
    const userId = userDetail.id;
    const { receipantId, content } = req.body;
    if (!receipantId || !content) {
      return res.json({ Message: "Receipant Id and content not found" });
    }
    if (receipantId === userId) {
      return res.json({ Message: "You can't send message to yourself" });
    }
    const receipant = await User.findById(receipantId);
    if (!receipant) {
      return res.json({ Message: "Receipant not found" });
    }
    const communication = await Communication.findOne({
      communicationMembers: { $all: [userId, receipantId] },
    });
    if (!communication) {
      const newCommunication = new Communication({
        communicationName: null,
        communicationDescription: null,
        communicationMembers: [userId, receipantId],
        communicationLastDetails: {
          lastMessage: content,
          lastMessageDate: new Date(),
        },
        communicationContent: [
          {
            senderId: userId,
            contentPath: null,
            content: content,
            likes: [],
            isRead: [userId],
            timeStamp: new Date(),
          },
        ],
      });
      await newCommunication.save();
      return res.json({
        Message: "Message Sent",
        communicationId: newCommunication._id,
        content: newCommunication.communicationContent[0],
      });
    }
    const newObject = {
      senderId: userId,
      contentPath: null,
      content: content,
      likes: [],
      isRead: [userId],
      timeStamp: new Date(),
    };
    communication.communicationContent.push(newObject);
    const sendedData = await communication.save();
    if (sendedData) {
      const updateMessage = await Communication.findByIdAndUpdate(
        communication._id,
        {
          communicationLastDetails: {
            lastMessage: content,
            lastMessageDate: new Date(),
          },
        }
      );
      if (updateMessage) {
        const lastMessage =
          communication.communicationContent[
            communication.communicationContent.length - 1
          ];
        return res.json({
          Message: "Message Sent",
          communicationId: communication._id,
          content: lastMessage,
        });
      }
    }
  } catch (error) {
    return res.json({ Message: "Internal Sever Error" });
  }
};

// Get Message Participant //
export const getParticipant = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader && authorizationHeader.split(" ")[1];
    if (!token) {
      return res.json({ Message: "Token not found" });
    }
    const userDetail = await decodeToken(token);
    if (!userDetail) {
      return res.json({ Message: "Invalid Token" });
    }
    const userId = userDetail.id;

    const communication = await Communication.find({
      communicationMembers: { $in: [userId] },
    }).populate("communicationMembers", "firstName lastName picturePath");

    if (!communication || communication.length === 0) {
      return res.json([]);
    }
    const newChannelObject = communication.map((response) => ({
      communicationId: response._id,
      communicationName: response.communicationName,
      communicationDescription: response.communicationDescription,
      communicationMembers: response.communicationMembers,
      communicationLastDetails: response.communicationLastDetails,
      receiptantDetails: response.communicationMembers.find(
        (id) => id._id.toString() !== userId.toString()
      ),
    }));
    return res.json(newChannelObject);
  } catch (error) {
    return res.json({ Message: "Internal Sever Error" });
  }
};

// Get Messages //
export const getMessages = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader && authorizationHeader.split(" ")[1];
    if (!token) {
      return res.json({ Message: "Token not found" });
    }
    const userDetail = await decodeToken(token);
    if (!userDetail) {
      return res.json({ Message: "Invalid Token" });
    }
    const userId = userDetail.id;
    const { communicationId } = req.body;
    if (!communicationId) {
      return res.json({ Message: "Communication Id not found" });
    }
    const content = await Communication.findById(communicationId);
    if (!content) {
      return res.json({ Message: "Communication not found" });
    }
    const messageObject = content.communicationContent.map((content) => ({
      senderId: content.senderId,
      contentPath: content.contentPath,
      content: content.content,
      likes: content.likes,
      isRead: content.isRead,
      timeStamp: content.timeStamp,
      direction:
        content.senderId.toString() === userId.toString() ? "right" : "left",
    }));
    return res.json(messageObject);
  } catch (error) {
    return res.json({ Message: "Internal Sever Error" });
  }
};
