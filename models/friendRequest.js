import mongoose from "mongoose";

const FriendRequestSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        friendRequest: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ]
    },
    { strictPopulate: false },
    { timestamps: true },
);

const FriendRequest = mongoose.model("FriendRequest", FriendRequestSchema);

export default FriendRequest;