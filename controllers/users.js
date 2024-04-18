import { decodeToken } from "../middleware/auth.js";
import User from "../models/User.js";
import FriendRequest from "../models/friendRequest.js";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((id) => id !== id);

    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* GET USER WITHOUT FRIENDS */
export const getUserWithoutFriends = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader && authorizationHeader.split(" ")[1];
    if (!token) {
      return res.json({ Message: "Token not found" });
    }
    const userDetail = await decodeToken(token);
    const userId = userDetail.id;
    const users = await User.find({});
    if (!users || users.length === 0) {
      return res.json({ Message: "User list not found" });
    }
    const usersWithoutFriends = users.filter((user) => user._id.toString() !== userId.toString());
    if (!usersWithoutFriends.legth === 0) {
      return res.json({ Message: "User list not found" });
    }
    return res.json(usersWithoutFriends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//========================================================================//
// GET SEND FRIEND REQUEST //
export const sendFriendRequest = async (req, res) => {
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
    const { friendId } = req.body;
    if (!friendId) {
      return res.json({ Message: "Friend Id not found" });
    }
    const friend = await FriendRequest.findOne({ userId: friendId });
    if (!friend) {
      const newRequest = new FriendRequest({
        userId: friendId,
        friendRequest: [userId],
      });
      await newRequest.save();
      return res.json({ Message: "Success" });
    } else {
      const filterUser = friend.friendRequest.includes(userId);
      if (filterUser) {
        return res.json({ Message: "Friend request already sent" });
      }
      friend.friendRequest.push(userId);
      await friend.save();
      return res.json({ Message: "Success" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// REJECT FRIEND REUQEST //
export const rejectRemoveFriendRequest = async (req, res) => {
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
    const { friendId } = req.body;
    if (!friendId) {
      return res.json({ Message: "Friend Id not found" });
    }
    const friend = await FriendRequest.findOne({ userId: userId });
    if (!friend) {
      return res.json({ Message: "Friend request not found" });
    }
    friend.friendRequest = friend.friendRequest.filter((id) => id !== friendId);
    await friend.save();
    return res.json({ Message: "Friend request rejected" });    
  } catch (error) {
    return res.status(500).json({ message: error.message });    
  }
}

// GET REQUEST LIST //
export const getFriendRequestList = async (req, res) => {
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
    const friendRequests = await FriendRequest.findOne({ userId: userId }).populate("friendRequest", "firstName lastName picturePath");
    if (!friendRequests) {
      return res.json([]);
    }
    const newRequest = friendRequests.friendRequest
    return res.json(newRequest);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
