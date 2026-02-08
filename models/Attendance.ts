import mongoose, { Schema, Document, Model } from 'mongoose';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface IAttendance extends Document {
    _id: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    date: Date;
    status: AttendanceStatus;
    markedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student ID is required'],
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
        },
        status: {
            type: String,
            enum: ['present', 'absent', 'late'],
            required: [true, 'Status is required'],
        },
        markedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Teacher ID is required'],
        },
    },
    {
        timestamps: true,
    }
);

// Create compound index to prevent duplicate entries
AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

const Attendance: Model<IAttendance> =
    mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;
