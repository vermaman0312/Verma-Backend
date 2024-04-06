import mongoose from "mongoose";
import { decodeToken } from "../middleware/auth.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;
    const user = await User.findById(userId);
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });

    await newPost.save();

    const post = await Post.find();

    res.status(201).json(post);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ $natural: -1 })
      .populate("comments.userId", "firstName lastName picturePath")
      .populate("comments.commentReply.userId", "firstName lastName picturePath");
    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId }).sort({ $natural: -1 })
      .populate("comments.userId", "firstName lastName picturePath")
      .populate("comments.commentReply.userId", "firstName lastName picturePath");
    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/* UPDATE */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        likes: post.likes,
      },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/* COMMENT */
export const sendComment = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader && authorizationHeader.split(" ")[1]

    if (!token) {
      throw new Error("Token not found");
    }

    const userDetail = await decodeToken(token);
    const userId = userDetail.id;

    const { postId, commentId, comment, commentReply } = req.body;

    const post = await Post.findById(postId);

    if (post) {
      if (!commentId || !commentReply) {
        const updatedComment = await Post.findByIdAndUpdate(postId, {
          comments: [
            ...post.comments,
            {
              comment: comment,
              commentReply: [],
              userId: userId,
            },
          ],
        })

        if (!updatedComment) {
          throw new Error("Could not update comment");
        }
        res.status(200).json(updatedComment);
      } else {
        const updatedComments = post.comments.map(comment => {
          if (comment._id.toString() === commentId.toString()) {
            return {
              ...comment,
              commentReply: [
                ...comment.commentReply,
                {
                  comment: commentReply,
                  userId: userId
                }
              ]
            };
          }
          return comment;
        });

        const updatedComment = await Post.findByIdAndUpdate(postId, { comments: updatedComments }, { new: true });


        if (!updatedComment) {
          throw new Error("Could not update comment");
        }
        res.status(200).json(updatedComment);
      }
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

/* GET COMMENT */
export const getComments = async (req, res) => {
  try {
    const { postId } = req.body;
    if (!postId) {
      throw new Error("Post Id not found");
    }
    const comment = await Post.findById(postId).populate("comments.userId", "firstName lastName picturePath")
      .populate("comments.commentReply.userId", "firstName lastName picturePath").sort({ "comments.createdAt": -1 });

    if (!comment) {
      throw new Error("post not found");
    }
    const newObject = comment && comment.comments;
    res.status(200).json(newObject);

  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}
