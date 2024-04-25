import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { decodeToken } from "../middleware/auth.js";

// REGISTER USER //
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGGING IN //
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return req.status(400).json({ msg: "User does not exist." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Password Change //
export const changePassword = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader && authorizationHeader.split(" ")[1]
    if (!token) {
      throw new Error("Token not found");
    }
    const userDetail = await decodeToken(token);
    const userId = userDetail.id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new Error("Old password or new password not found");
    }
    const loggedInUser = await User.findById(userId);
    if (!loggedInUser) {
      throw new Error("User not found");
    }
    const isMatch = await bcrypt.compare(oldPassword, loggedInUser.password);
    if (isMatch) {
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(newPassword, salt);
      const updatedPassword = await User.findByIdAndUpdate(userId, { password: passwordHash });
      if (!updatedPassword) {
        throw new Error("Could not update password");
      }
      return res.json({ Message: "Success" });
    } else {
      return res.status(400).json({ msg: "Old password is incorrect." });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Username Change //
export const changeUserName = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader && authorizationHeader.split(" ")[1]
    if (!token) {
      return res.json({ Message: "Token not found" });
    }
    const userDetail = await decodeToken(token);
    const userId = userDetail.id;
    const { firstName, lastName } = req.body;
    if (!firstName || !lastName) {
      return res.json({ Message: "First name or last name not found" });
    }
    let existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.json({ Message: "User not found" });
    }
    const updatedUserName = await User.findByIdAndUpdate(userId, {
      firstName: firstName,
      lastName: lastName,
    });
    if (!updatedUserName) {
      return res.json({ Message: "Could not update username" });
    }
    return res.json({ Message: "Success" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Profile image change //
export const changeProfileImage = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader && authorizationHeader.split(" ")[1]
    if (!token) {
      return res.json({ Message: "Token not found" })
    }
    const userDetail = await decodeToken(token);
    const userId = userDetail.id;
    const { picturePath } = req.body;
    if (!picturePath) {
      return res.json({ Message: "File not found" })
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ Message: "User not found" })
    }
    const updatedProfileImage = await User.findByIdAndUpdate(userId, {
      picturePath: picturePath
    });

    if (!updatedProfileImage) {
      return res.json({ Message: "Failed to update Profile image" })
    }
    return res.json({ Message: "Success" })
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
