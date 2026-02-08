import mongoose, { Schema, Document, Model } from 'mongoose';

export type ActivityType =
    | 'LOGIN'
    | 'LOGOUT'
    | 'REGISTER'
    | 'PROFILE_UPDATE'
    | 'MARKS_SUBMITTED'
    | 'MARKS_UPDATED'
    | 'ATTENDANCE_MARKED'
    | 'ATTENDANCE_SESSION_CREATED'
    | 'SKILL_ADDED'
    | 'SKILL_UPDATED'
    | 'AI_REPORT_GENERATED'
    | 'CAREER_ROADMAP_GENERATED'
    | 'USER_VERIFIED'
    | 'USER_DELETED'
    | 'CHAT_MESSAGE_SENT'
    | 'OTHER';

export interface IActivityLog extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    userRole: 'TEACHER' | 'STUDENT';
    userName: string;
    userEmail: string;
    activityType: ActivityType;
    description: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        userRole: {
            type: String,
            enum: ['TEACHER', 'STUDENT'],
            required: true,
            index: true,
        },
        userName: {
            type: String,
            required: true,
        },
        userEmail: {
            type: String,
            required: true,
        },
        activityType: {
            type: String,
            enum: [
                'LOGIN',
                'LOGOUT',
                'REGISTER',
                'PROFILE_UPDATE',
                'MARKS_SUBMITTED',
                'MARKS_UPDATED',
                'ATTENDANCE_MARKED',
                'ATTENDANCE_SESSION_CREATED',
                'SKILL_ADDED',
                'SKILL_UPDATED',
                'AI_REPORT_GENERATED',
                'CAREER_ROADMAP_GENERATED',
                'USER_VERIFIED',
                'USER_DELETED',
                'CHAT_MESSAGE_SENT',
                'OTHER',
            ],
            required: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Create compound indexes for efficient queries
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ activityType: 1, createdAt: -1 });
ActivityLogSchema.index({ userRole: 1, createdAt: -1 });

// Prevent model recompilation in development
const ActivityLog: Model<IActivityLog> =
    mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

export default ActivityLog;
