import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendanceSession extends Document {
    _id: mongoose.Types.ObjectId;
    teacherId: mongoose.Types.ObjectId;
    sessionCode: string;
    subject?: string;
    date: Date;
    startTime: Date;
    endTime?: Date;
    isActive: boolean;
    attendedStudents: mongoose.Types.ObjectId[];
    location?: {
        latitude: number;
        longitude: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const AttendanceSessionSchema = new Schema<IAttendanceSession>(
    {
        teacherId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Teacher ID is required'],
        },
        sessionCode: {
            type: String,
            required: [true, 'Session code is required'],
            unique: true,
        },
        subject: {
            type: String,
            trim: true,
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
            default: Date.now,
        },
        startTime: {
            type: Date,
            required: [true, 'Start time is required'],
            default: Date.now,
        },
        endTime: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        attendedStudents: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        location: {
            latitude: {
                type: Number,
            },
            longitude: {
                type: Number,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
AttendanceSessionSchema.index({ teacherId: 1, isActive: 1 });

const AttendanceSession: Model<IAttendanceSession> =
    mongoose.models.AttendanceSession || mongoose.model<IAttendanceSession>('AttendanceSession', AttendanceSessionSchema);

export default AttendanceSession;
