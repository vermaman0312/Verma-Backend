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
    res.status(500).json({ message: error.message });
  }
};

/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find()
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
    const posts = await Post.find({ userId })
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

    const { postId, comment } = req.body;

    if (!postId || !comment) {
      throw new Error("Post Id or comment not found");
    }

    const post = await Post.findById(postId);

    if (post) {
      const updatedComment = await Post.findByIdAndUpdate(postId, {
        comments: [
          ...post.comments,
          {
            comment: comment,
            commentReply: [],
            userId: userId,
            likes: [],
          },
        ],
      })

      if (!updatedComment) {
        throw new Error("Could not update comment");
      }
      return res.status(200).json(updatedComment);
    }
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
}

/* REPLY COMMENT */
export const sendCommentReply = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader && authorizationHeader.split(" ")[1];

    if (!token) {
      throw new Error("Token not found");
    }

    const userDetail = await decodeToken(token);
    const userId = userDetail.id;

    const { postId, commentId, commentReply } = req.body;

    if (!postId || !commentId || !commentReply) {
      throw new Error("Post Id, comment Id, or comment reply not found");
    }

    const post = await Post.findById(postId);

    if (!post) {
      throw new Error("Post not found");
    }

    const filteredComment = post.comments.filter((filter) => filter._id.toString() === commentId.toString());

    const replyObject = {
      comment: commentReply,
      userId: userId,
      likes: [],
    }

    if (filteredComment.length > 0) {
      filteredComment[0].commentReply.push(replyObject);
    }
    const updatedComment = await post.save();

    if (!updatedComment) {
      throw new Error("Could not update post");
    }

    return res.json(updatedComment);
  } catch (error) {
    return res.status(404).json({ message: error.message });
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
      .populate("comments.commentReply.userId", "firstName lastName picturePath").sort({ "comments.timestamps": -1 });

    if (!comment) {
      throw new Error("post not found");
    }
    const newObject = comment && comment.comments;
    res.status(200).json(newObject);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Edit Comment //
export const editComment = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader && authorizationHeader.split(" ")[1]

    if (!token) {
      return res.json({ Message: "Token not found." })
    }

    const userDetail = await decodeToken(token);
    const userId = userDetail.id;
    const { postId, commentId, newComment } = req.body;
    if (!postId || !commentId || !newComment) {
      return res.json({ Message: "Post id, comment id and new comment are not found." })
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.json({ Message: "Post not found." })
    }
    const commentToUpdate = post.comments.find(comment => comment._id.toString() === commentId.toString());
    if (commentToUpdate) {
      commentToUpdate.comment = newComment;
      await post.save();
      return res.json({ Message: "Success" });
    } else {
      return res.status(404).json({ message: "Comment not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Edit Reply Comment //
export const editReplyComment = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader && authorizationHeader.split(" ")[1]
    if (!token) {
      throw new Error("Token not found");
    }
    const userDetail = await decodeToken(token);
    const userId = userDetail.id;
    const { postId, commentId, commentReplyId, newComment } = req.body;
    if (!postId || !commentId || !commentReplyId || !newComment) {
      return res.json({ Message: "Post id, comment id, comment reply id and new comment are not found." })
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.json({ Message: "Post not found." })
    }
    const commentToUpdate = post.comments.find(comment => comment._id.toString() === commentId.toString());
    if (!commentToUpdate) {
      return res.json({ Message: "Comment not found." })
    }
    const replyCommentUpdate = commentToUpdate.commentReply.find(comment => comment._id.toString() === commentReplyId.toString());
    if (!replyCommentUpdate) {
      return res.json({ Message: "Comment reply not found." })
    }
    replyCommentUpdate.comment = newComment;
    const updatedComment = await post.save();
    if (!updatedComment) {
      return res.json({ Message: "Could not update post" });
    }
    return res.json({ Message: "Success" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Delete Comment //
export const deleteComment = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader && authorizationHeader.split(" ")[1]
    if (!token) {
      throw new Error("Token not found");
    }
    const userDetail = await decodeToken(token);
    const userId = userDetail.id;
    const { postId, commentId } = req.body;
    if (!postId || !commentId) {
      return res.json({ Message: "Post id and comment id are not found." })
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.json({ Message: "Post not found." })
    }
    const comment = post.comments.find(comment => comment._id.toString() === commentId.toString());
    if (!comment) {
      return res.json({ Message: "Comment not found." })
    }
    post.comments = post.comments.filter(comment => comment._id.toString() !== commentId.toString());
    const updatedPost = await post.save();
    if (!updatedPost) {
      return res.json({ Message: "Failed to delete post" });
    }
    return res.json({ Message: "Success" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Delete Reply Comment //
export const deleteReplyComment = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader && authorizationHeader.split(" ")[1]
    if (!token) {
      throw new Error("Token not found");
    }
    const userDetail = await decodeToken(token);
    const userId = userDetail.id;
    const { postId, commentId, commentReplyId } = req.body;
    if (!postId || !commentId || !commentReplyId) {
      return res.json({ Message: "Post id, comment id and comment reply id are not found." })
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.json({ Message: "Post not found." });
    }
    const comment = post.comments.find(comment => comment._id.toString() === commentId.toString());
    if (!comment) {
      return res.json({ Message: "Comment not found." });
    }
    const replyComment = comment.commentReply.find(comment => comment._id.toString() === commentReplyId.toString());
    if (!replyComment) {
      return res.json({ Message: "Comment reply not found." });
    }
    comment.commentReply = comment.commentReply.filter(comment => comment._id.toString() !== commentReplyId.toString());
    const updatedComment = await post.save();
    if (!updatedComment) {
      return res.json({ Message: "Failed to delete post" });
    }
    return res.json({ Message: "Success" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
