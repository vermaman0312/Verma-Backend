import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    location: String,
    description: String,
    picturePath: String,
    userPicturePath: String,
    likes: {
      type: Map,
      of: Boolean,
    },
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.String,
          required: false,
          default: null,
          ref: 'User'
        },
        comment: {
          type: String,
          required: false,
          default: null,
        },
        likes: {
          type: Array,
          required: false,
          default: null,
        },
        commentReply: [
          {
            userId: {
              type: mongoose.Schema.Types.String,
              required: false,
              default: null,
              ref: 'User'
            },
            comment: {
              type: String,
              required: false,
              default: null,
            },
            likes: {
              type: Array,
              required: false,
              default: null,
            },
            timestamps: {
              type: Date,
              required: false,
              default: new Date(),
            }
          }
        ],
        timestamps: {
          type: Date,
          required: false,
          default: new Date(),
        }
      }
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
