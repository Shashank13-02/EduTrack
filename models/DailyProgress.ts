import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDailyProgress extends Document {
    studentId: mongoose.Types.ObjectId;
    date: string; // YYYY-MM-DD format
    dayNumber: number; // Day 1, Day 2, etc. of learning journey
    completedTasks: {
        taskId: string;
        taskIndex: number; // Index in daily routine
        completedAt: Date;
    }[];
    totalTasks: number;
    completionRate: number; // 0-100
    createdAt: Date;
    updatedAt: Date;
}

const DailyProgressSchema = new Schema<IDailyProgress>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        dayNumber: {
            type: Number,
            required: true,
        },
        completedTasks: [
            {
                taskId: {
                    type: String,
                    required: true,
                },
                taskIndex: {
                    type: Number,
                    required: true,
                },
                completedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        totalTasks: {
            type: Number,
            required: true,
            default: 0,
        },
        completionRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
    },
    { timestamps: true }
);

// Compound index for efficient queries
DailyProgressSchema.index({ studentId: 1, date: 1 }, { unique: true });

const DailyProgress: Model<IDailyProgress> =
    mongoose.models.DailyProgress || mongoose.model<IDailyProgress>('DailyProgress', DailyProgressSchema);

export default DailyProgress;
