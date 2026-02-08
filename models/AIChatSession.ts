import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAIChatSession extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AIChatSessionSchema = new Schema<IAIChatSession>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            default: 'New Chat',
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying of user's chat sessions, sorted by last activity
AIChatSessionSchema.index({ userId: 1, lastMessageAt: -1 });

const AIChatSession: Model<IAIChatSession> =
    mongoose.models.AIChatSession || mongoose.model<IAIChatSession>('AIChatSession', AIChatSessionSchema);

export default AIChatSession;
