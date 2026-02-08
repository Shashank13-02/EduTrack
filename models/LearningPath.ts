import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILearningPath extends Document {
    studentId: mongoose.Types.ObjectId;
    dailyRoutine: {
        day: string;
        tasks: {
            taskId: string; // Unique identifier for each task
            title: string;
            description: string;
            time?: string;
            type: 'study' | 'skill' | 'rest';
        }[];
    }[];
    startedAt?: Date; // When user first accessed their learning path
    lastUpdated: Date;
}

const LearningPathSchema = new Schema<ILearningPath>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        dailyRoutine: [
            {
                day: String,
                tasks: [
                    {
                        taskId: {
                            type: String,
                            required: true,
                        },
                        title: String,
                        description: String,
                        time: String,
                        type: {
                            type: String,
                            enum: ['study', 'skill', 'rest'],
                            default: 'study',
                        },
                    },
                ],
            },
        ],
        startedAt: {
            type: Date,
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const LearningPath: Model<ILearningPath> =
    mongoose.models.LearningPath || mongoose.model<ILearningPath>('LearningPath', LearningPathSchema);

export default LearningPath;
