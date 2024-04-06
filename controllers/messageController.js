import { decodeToken } from "../middleware/auth.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const getConversations = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader && authorizationHeader.split(" ")[1]

    if (!token) {
      throw new Error("Token not found");
    }

    const userDetail = await decodeToken(token);
    const userId = userDetail.id;

    const conversations = await Conversation.find({
      recipients: {
        $in: [userId],
      },
    })
      .populate("recipients", "firstName lastName picturePath friends")
      .sort("-updatedAt")
      .lean();

    const newObject = conversations && conversations.map((conversation) => ({
      conversationId: conversation._id,
      userDetails: (() => {
        const filteredRecipients = conversation.recipients && conversation.recipients
          .filter((filterData) => filterData._id.toString() === userId.toString());

        if (filteredRecipients.length === 1) {
          const { _id, firstName, lastName, picturePath } = filteredRecipients[0];
          return {
            userId: _id,
            firstName,
            lastName,
            picturePath,
          };
        } else {
          return filteredRecipients.map(filteredRecipient => ({
            userId: filteredRecipient._id,
            firstName: filteredRecipient.firstName,
            lastName: filteredRecipient.lastName,
            picturePath: filteredRecipient.picturePath,
          }));
        }
      })(),
      recipientDetails: (() => {
        const filteredRecipients = conversation.recipients && conversation.recipients
          .filter((filterData) => filterData._id.toString() !== userId.toString());

        if (filteredRecipients.length === 1) {
          const { _id, firstName, lastName, picturePath } = filteredRecipients[0];
          return {
            userId: _id,
            firstName,
            lastName,
            picturePath,
          };
        } else {
          return filteredRecipients.map(filteredRecipient => ({
            userId: filteredRecipient._id,
            firstName: filteredRecipient.firstName,
            lastName: filteredRecipient.lastName,
            picturePath: filteredRecipient.picturePath,
          }));
        }
      })(),
      lastMessageAt: conversation.lastMessageAt,
    }));

    return res.json(newObject);


  } catch (error) {
    return res.status(400).json({ message: error });
  }
}

export const getMessages = async (req, res) => {
  try {
    const conversationId = req.params.id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const messages = await Message.find({
      conversation: conversation._id,
    })
      .populate("sender", "firstName lastName picturePath")
      .sort("-createdAt")
      .limit(12);

    return res.json(messages);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
}

export const sendMessage = async (req, res) => {
  try {
    const recipientId = req.params.id;
    const { content, userId } = req.body;

    const recipient = await User.findById(recipientId);

    if (!recipient) {
      throw new Error("Recipient not found");
    }

    let conversation = await Conversation.findOne({
      recipients: {
        $all: [userId, recipientId],
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        recipients: [userId, recipientId],
      });
    }

    await Message.create({
      conversation: conversation._id,
      sender: userId,
      content,
    });

    conversation.lastMessageAt = Date.now();

    conversation.save();

    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
}
