import mongoose from "mongoose";

const ChannelSchema = new mongoose.Schema(
    {
        channelName: {
            type: String,
            required: false,
            min: 2,
            max: 50,
            default: null,
        },
        channelDescription: {
            type: String,
            required: false,
            min: 2,
            max: 50,
            default: null,
        },
        channelImage: {
            type: String,
            required: false,
            default: null,
        },
        channelMembers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        channelAdmin: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        channelCreatedBy: {
            type: mongoose.Schema.Types.String,
            required: false,
            default: null,
            ref: 'User'
        },
        isCommunicateEveryOne: {
            type: Boolean,
            required: false,
            default: false,
        },
        privateChannel: {
            type: Boolean,
            required: false,
            default: false,
        },
        viewedChannel: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        channelContent: [
            {
                senderId: {
                    type: mongoose.Schema.Types.String,
                    required: false,
                    default: null,
                    ref: 'User'
                },
                contentPath: {
                    type: String,
                    required: false,
                    default: null,
                },
                content: {
                    type: String,
                    required: false,
                    default: null,
                },
                likes: [
                    {
                        type: mongoose.Schema.Types.String,
                        required: false,
                        default: null,
                        ref: 'User'
                    }
                ],
                isRead: [
                    {
                        type: mongoose.Schema.Types.String,
                        required: false,
                        default: null,
                        ref: 'User'
                    }
                ],
                timestamps: {
                    type: Date,
                    required: false,
                    default: new Date(),
                }
            }
        ],
        channelCreatedDate: {
            type: Date,
            required: false,
            default: new Date(),
        }
    },
    { strictPopulate: false },
    { timestamps: true },
);

const Channel = mongoose.model("Channel", ChannelSchema);

export default Channel;