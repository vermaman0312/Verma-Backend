import { decodeToken } from "../middleware/auth.js";
import Channel from "../models/Channel.js";

// Create Channel //
export const createChannel = async (req, res) => {
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
        const { channelName, channelDescription, channelImage, privateChannel } = req.body;
        console.log("req.body", req.body)
        if (!channelName || !channelDescription) {
            return res.json({ Message: "Channel name and channel description invalid" });
        }
        const channel = new Channel({
            channelName: channelName,
            channelDescription: channelDescription,
            channelImage: channelImage ? channelImage : undefined,
            channelMembers: [userId],
            channelAdmin: [userId],
            channelCreatedBy: userId,
            privateChannel: privateChannel,
            viewedChannel: [userId],
            channelContent: [],
        });
        const savedChannel = await channel.save();
        if (!savedChannel) {
            return res.json({ Message: "Failed to create channel" });
        }
        return res.json(channel)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Get Channel //
export const getAllChannel = async (req, res) => {
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
        const channel = await Channel.find({});
        if (!channel || channel.length === 0) {
            return res.json([]);
        }
        const newChannelObject = channel.map((response) => ({
            channelId: response._id,
            channelName: response.channelName,
            channelDescription: response.channelDescription,
            channelImage: response.channelImage,
            channelCreatedBy: response.channelCreatedBy,
            channelMembers: response.channelMembers,
            privateChannel: response.privateChannel,
            viewedChannel: response.viewedChannel,
            channelCreatedDate: response.channelCreatedDate,
        }));
        return res.json(newChannelObject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Get My Chanell list //
export const getAllMyChannel = async (req, res) => {
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
        const channel = await Channel.find({ channelCreatedBy: userId });
        if (!channel || channel.length === 0) {
            return res.json([]);
        }
        const newChannelObject = channel.map((response) => ({
            channelId: response._id,
            channelName: response.channelName,
            channelDescription: response.channelDescription,
            channelImage: response.channelImage,
            channelMembers: response.channelMembers,
            channelCreatedBy: response.channelCreatedBy,
            privateChannel: response.privateChannel,
            viewedChannel: response.viewedChannel,
            channelCreatedDate: response.channelCreatedDate,
        }));
        return res.json(newChannelObject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Get Channel By Id //
export const getChannelById = async (req, res) => {
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
        const { channelId } = req.body;
        console.log("channelId", channelId)
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.json({ Message: "Channel not found" });
        }
        const newChannelObject = {
            channelId: channel._id,
            channelName: channel.channelName,
            channelDescription: channel.channelDescription,
            channelImage: channel.channelImage,
            channelMembers: channel.channelMembers,
            channelAdmin: channel.channelAdmin,
            channelCreatedBy: channel.channelCreatedBy,
            privateChannel: channel.privateChannel,
            viewedChannel: channel.viewedChannel,
            channelCreatedDate: channel.channelCreatedDate,
        };
        return res.json(newChannelObject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Delete Channel //
export const deleteChannel = async (req, res) => {
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
        const { channelId } = req.body;
        if (!channelId) {
            return res.json({ Message: "Channel Id not found" });
        }
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.json({ Message: "Channel not found" });
        }
        const filteredChannel = channel.channelCreatedBy === userId ? true : false;
        if (!filteredChannel) {
            return res.json({ Message: "You are not authorized to delete this channel" });
        }
        const deletedChannel = await Channel.findByIdAndDelete(channelId);
        if (!deletedChannel) {
            return res.json({ Message: "Failed to delete channel" });
        }
        return res.json({ Message: "Channel deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Update Channel //
export const updateChannel = async (req, res) => {
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
        const { channelId } = req.params;
        const { channelName, channelDescription, channelImage, privateChannel } = req.body;
        if (!channelId) {
            return res.json({ Message: "Channel Id not found" });
        }
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.json({ Message: "Channel not found" });
        }
        const filteredChannel = channel.channelCreatedBy === userId ? true : false;
        if (!filteredChannel) {
            return res.json({ Message: "You are not authorized to update this channel" });
        }
        const updatedChannel = await Channel.findByIdAndUpdate(channelId, {
            channelName: channelName ? channelName : channel.channelName,
            channelDescription: channelDescription ? channelDescription : channel.channelDescription,
            channelImage: channelImage ? channelImage : channel.channelImage,
            privateChannel: privateChannel ? privateChannel : channel.privateChannel,
        });
        if (!updatedChannel) {
            return res.json({ Message: "Failed to update channel" });
        }
        return res.json({ Message: "Channel updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Join Channel //
export const joinChannel = async (req, res) => {
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
        const { channelId } = req.body;
        if (!channelId) {
            return res.json({ Message: "Channel Id not found" });
        }
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.json({ Message: "Channel not found" });
        }
        const existingUser = channel.channelMembers.includes(userId);
        if (existingUser) {
            return res.json({ Message: "User already joined this channel" });
        }
        channel.channelMembers.push(userId);
        const updatedChannel = await channel.save();
        if (!updatedChannel) {
            return res.json({ Message: "Failed to join channel" });
        }
        return res.json({ Message: "Channel joined successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Leave Channel //
export const leaveChannel = async (req, res) => {
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
        const { channelId } = req.body;
        if (!channelId) {
            return res.json({ Message: "Channel Id not found" });
        }
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.json({ Message: "Channel not found" });
        }
        const filteredUser = channel.channelMembers.includes(userId);
        if (!filteredUser) {
            return res.json({ Message: "User not found in channel" });
        }
        channel.channelMembers.splice(channel.channelMembers.indexOf(userId), 1);
        const updatedChannel = await channel.save();
        if (!updatedChannel) {
            return res.json({ Message: "Failed to leave channel" });
        }
        return res.json({ Message: "Channel left successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Add Member //
export const addMemberChannel = async (req, res) => {
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
        const { channelId, receipantId } = req.body;
        if (!channelId || !receipantId) {
            return res.json({ Message: "Channel Id not found" });
        }
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.json({ Message: "Channel not found" });
        }
        const filteredUser = channel.channelAdmin.includes(userId);
        if (!filteredUser) {
            return res.json({ Message: "You are not authorize to add member" });
        }
        channel.channelMembers.push(receipantId);
        const updatedChannel = await channel.save();
        if (!updatedChannel) {
            return res.json({ Message: "Failed to add member" });
        }
        return res.json({ Message: "Member added successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Remove Member //
export const removeMember = async (req, res) => {
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
        const { channelId, receipantId } = req.body;
        if (!channelId || !receipantId) {
            return res.json({ Message: "Channel Id not found" });
        }
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.json({ Message: "Channel not found" });
        }
        const filteredUser = channel.channelAdmin.includes(userId);
        if (!filteredUser) {
            return res.json({ Message: "You are not authorize to remove member" });
        }
        channel.channelMembers.splice(channel.channelMembers.indexOf(receipantId), 1);
        const updatedChannel = await channel.save();
        if (!updatedChannel) {
            return res.json({ Message: "Failed to remove member" });
        }
        return res.json({ Message: "Member removed successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Add Admin //
export const addAdminChannel = async (req, res) => {
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
        const { channelId, receipantId } = req.body;
        if (!channelId || !receipantId) {
            return res.json({ Message: "Channel Id not found" });
        }
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.json({ Message: "Channel not found" });
        }
        const filteredUser = channel.channelAdmin.includes(userId);
        if (!filteredUser) {
            return res.json({ Message: "You are not authorize to add admin" });
        }
        const existingUser = channel.channelMembers.includes(receipantId);
        if (!existingUser) {
            channel.channelMembers.push(receipantId);
            channel.channelAdmin.push(receipantId);
            const updatedChannel = await channel.save();
            if (!updatedChannel) {
                return res.json({ Message: "Failed to add admin" });
            }
            return res.json({ Message: "Admin added successfully" });
        } else {
            channel.channelAdmin.push(receipantId);
            const updatedChannel = await channel.save();
            if (!updatedChannel) {
                return res.json({ Message: "Failed to add admin" });
            }
            return res.json({ Message: "Admin added successfully" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Remove Admin //
export const removeAdminChannel = async (req, res) => {
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
        const { channelId, receipantId } = req.body;
        if (!channelId || !receipantId) {
            return res.json({ Message: "Channel Id not found" });
        }
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.json({ Message: "Channel not found" });
        }
        const filteredUser = channel.channelAdmin.includes(userId);
        if (!filteredUser) {
            return res.json({ Message: "You are not authorize to remove admin" });
        }
        channel.channelAdmin.splice(channel.channelAdmin.indexOf(receipantId), 1);
        const updatedChannel = await channel.save();
        if (!updatedChannel) {
            return res.json({ Message: "Failed to remove admin" });
        }
        return res.json({ Message: "Admin removed successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Send Content in Channel //
export const sendContentChannel = async (req, res) => {
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
        const { channelId, contentPath, content } = req.body;
        if (!channelId) {
            return res.json({ Message: "Channel Id not found" });
        }
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.json({ Message: "Channel not found" });
        }
        const newObject = {
            senderId: userId,
            contentPath: contentPath ? contentPath : undefined,
            content: content,
            likes: [],
        }
        channel.channelContent.push(newObject);
        const updatedChannel = await channel.save();
        if (!updatedChannel) {
            return res.json({ Message: "Failed to send content" });
        }
        return res.json({ Message: "Content sent successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Like Content in Channel //
export const likeRemoveLikeContent = async (req, res) => {
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
        const { channelId, contentId } = req.body;
        if (!channelId) {
            return res.json({ Message: "Channel Id not found" });
        }
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.json({ Message: "Channel not found" });
        }
        const content = channel.channelContent.find(content => content._id.toString() === contentId.toString());
        if (!content) {
            return res.json({ Message: "Content not found" });
        }
        const existingUser = content.likes.includes(userId);
        if (!existingUser) {
            content.likes.push(userId);
            const updatedChannel = await channel.save();
            if (!updatedChannel) {
                return res.json({ Message: "Failed to like content" });
            }
            return res.json({ Message: "Content liked successfully" });
        } else {
            content.likes.splice(content.likes.indexOf(userId), 1);
            const updatedChannel = await channel.save();
            if (!updatedChannel) {
                return res.json({ Message: "Failed to dislike content" });
            }
            return res.json({ Message: "Content disliked successfully" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
