import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPerformance extends Document {
    _id: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    subjectName: string;
    midSem1: number | null;
    midSem2: number | null;
    endSem: number | null;
    assignment: number | null;
    engagementScore: number;
    createdAt: Date;
    updatedAt: Date;
}

const PerformanceSchema = new Schema<IPerformance>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student ID is required'],
        },
        subjectName: {
            type: String,
            required: [true, 'Subject name is required'],
            trim: true,
        },
        midSem1: {
            type: Number,
            min: 0,
            max: 10,
            default: null,
        },
        midSem2: {
            type: Number,
            min: 0,
            max: 10,
            default: null,
        },
        endSem: {
            type: Number,
            min: 0,
            max: 70,
            default: null,
        },
        assignment: {
            type: Number,
            min: 0,
            max: 10,
            default: null,
        },
        engagementScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
PerformanceSchema.index({ studentId: 1, subjectName: 1 });

const Performance: Model<IPerformance> =
    mongoose.models.Performance || mongoose.model<IPerformance>('Performance', PerformanceSchema);

export default Performance;
