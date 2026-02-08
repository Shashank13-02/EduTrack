import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
    _id: mongoose.Types.ObjectId;
    chatId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content: string;
    isAIGenerated: boolean;
    performanceContext?: {
        attendancePercent?: number;
        averageScore?: number;
        engagementScore?: number;
        weakAreas?: string[];
    };
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        chatId: {
            type: Schema.Types.ObjectId,
            ref: 'Chat',
            required: [true, 'Chat ID is required'],
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Sender ID is required'],
        },
        content: {
            type: String,
            required: [true, 'Message content is required'],
            trim: true,
        },
        isAIGenerated: {
            type: Boolean,
            default: false,
        },
        performanceContext: {
            attendancePercent: Number,
            averageScore: Number,
            engagementScore: Number,
            weakAreas: [String],
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient message queries
MessageSchema.index({ chatId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
