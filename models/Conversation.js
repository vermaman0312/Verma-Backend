import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    recipients: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: String,
      required: false,
      default: null
    },
    lastMessageAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Conversation  = mongoose.model("conversation", ConversationSchema);

export default Conversation;
