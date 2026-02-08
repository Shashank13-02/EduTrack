import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChat extends Document {
    _id: mongoose.Types.ObjectId;
    participants: {
        teacherId: mongoose.Types.ObjectId;
        studentId: mongoose.Types.ObjectId;
    };
    lastMessage?: {
        content: string;
        senderId: mongoose.Types.ObjectId;
        timestamp: Date;
    };
    unreadCount?: {
        teacher: number;
        student: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
    {
        participants: {
            teacherId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: [true, 'Teacher ID is required'],
            },
            studentId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: [true, 'Student ID is required'],
            },
        },
        lastMessage: {
            content: {
                type: String,
                default: '',
            },
            senderId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
        unreadCount: {
            teacher: {
                type: Number,
                default: 0,
            },
            student: {
                type: Number,
                default: 0,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient participant lookups
ChatSchema.index({ 'participants.teacherId': 1, 'participants.studentId': 1 }, { unique: true });
ChatSchema.index({ 'participants.teacherId': 1 });
ChatSchema.index({ 'participants.studentId': 1 });

const Chat: Model<IChat> = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);

export default Chat;
