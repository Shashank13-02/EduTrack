import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChatMessage extends Document {
    userId: mongoose.Types.ObjectId;
    sessionId?: mongoose.Types.ObjectId;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: {
        sources?: string[];
        context?: string;
        tokens?: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        sessionId: {
            type: Schema.Types.ObjectId,
            ref: 'AIChatSession',
            index: true,
        },
        role: {
            type: String,
            enum: ['user', 'assistant', 'system'],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        metadata: {
            sources: [String],
            context: String,
            tokens: Number,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying of user's chat history
ChatMessageSchema.index({ userId: 1, createdAt: -1 });

const ChatMessage: Model<IChatMessage> =
    mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

export default ChatMessage;
