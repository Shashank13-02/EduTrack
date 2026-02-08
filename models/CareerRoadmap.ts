import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICareerRoadmap extends Document {
    studentId: mongoose.Types.ObjectId;
    department: string;
    roadmaps: {
        title: string;
        milestones: {
            title: string;
            description: string;
            status: 'locked' | 'current' | 'completed';
            resources?: string[];
        }[];
    }[];
    lastUpdated: Date;
}

const CareerRoadmapSchema = new Schema<ICareerRoadmap>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        department: String,
        roadmaps: [
            {
                title: String,
                milestones: [
                    {
                        title: String,
                        description: String,
                        status: {
                            type: String,
                            enum: ['locked', 'current', 'completed'],
                            default: 'locked',
                        },
                        resources: [String],
                    },
                ],
            },
        ],
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const CareerRoadmap: Model<ICareerRoadmap> =
    mongoose.models.CareerRoadmap || mongoose.model<ICareerRoadmap>('CareerRoadmap', CareerRoadmapSchema);

export default CareerRoadmap;
