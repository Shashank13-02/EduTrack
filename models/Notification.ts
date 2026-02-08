import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: 'MARKS_PUBLISHED' | 'ATTENDANCE_WARNING' | 'ALERT' | 'AI_REPORT';
    isRead: boolean;
    link?: string;
    reportId?: mongoose.Types.ObjectId; // Reference to AIReport
    generatedBy?: mongoose.Types.ObjectId; // Teacher who generated the report
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
        },
        type: {
            type: String,
            enum: ['MARKS_PUBLISHED', 'ATTENDANCE_WARNING', 'ALERT', 'AI_REPORT'],
            default: 'ALERT',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
            trim: true,
        },
        reportId: {
            type: Schema.Types.ObjectId,
            ref: 'AIReport',
        },
        generatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 });

const Notification: Model<INotification> =
    mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
