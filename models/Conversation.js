import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    recipients: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessageAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Conversation  = mongoose.model("conversation", ConversationSchema);

export default Conversation;
