import mongoose from "mongoose";

const CommunicationSchema = new mongoose.Schema(
    {
        communicationName: {
            type: String,
            required: false,
            min: 2,
            max: 50,
            default: null,
        },
        communicationDescription: {
            type: String,
            required: false,
            min: 2,
            max: 50,
            default: null,
        },
        communicationMembers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: false,
                ref: 'User',
            }
        ],
        communicationLastDetails: {
            lastMessage: {
                type: String,
                required: false,
                default: null,
            },
            lastMessageDate: {
                type: Date,
                required: false,
                default: null,
            }
        },
        communicationContent: [
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
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User',
                    }
                ],
                isRead: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User',
                    }
                ],
                timeStamp: {
                    type: Date,
                    required: false,
                    default: null,
                }
            }
        ]
    },
    { timestamps: true }
);

const Communication = mongoose.model("Communication", CommunicationSchema);

export default Communication;
